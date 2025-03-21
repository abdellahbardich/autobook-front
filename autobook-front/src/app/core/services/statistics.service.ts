import { Injectable } from '@angular/core';
import { ConversationService } from './conversation.service';
import { BookService } from './book.service';
import { CollectionService } from './collection.service';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  
  constructor(
    private conversationService: ConversationService,
    private bookService: BookService,
    private collectionService: CollectionService
  ) {}
  
  getStatistics(): Observable<any> {
    // Step 1: Get all conversations
    return this.conversationService.getConversations().pipe(
      switchMap(conversations => {
        // Step 2: Get books for each conversation
        const bookObservables = conversations.map(conversation => 
          this.bookService.getBooksInConversation(conversation.conversationId).pipe(
            catchError(() => of([]))
          )
        );
        
        // Step 3: Get all collections (without books)
        return forkJoin([
          of(conversations),
          forkJoin(bookObservables).pipe(catchError(() => of([]))),
          this.collectionService.getCollections().pipe(catchError(() => of([])))
        ]);
      }),
      map(([conversations, booksArrays, collections]) => {
        // Flatten books array
        const allBooks = booksArrays.flat();
        
        // Calculate statistics
        return {
          totalConversations: conversations.length,
          totalBooks: allBooks.length,
          totalCollections: collections.length,
          
          // Books by type
          booksByType: this.countByProperty(allBooks, 'bookType'),
          
          // Books by status
          booksByStatus: this.countByProperty(allBooks, 'status'),
          
          // Creation activity over time (by month)
          creationActivity: this.getCreationActivity(conversations, allBooks),
          
          // Collections summary (just names and counts)
          collectionSummary: collections.map(collection => ({
            name: collection.name,
            // Collection doesn't have books, so we can't show count here
            // We'd need to fetch collection details for each collection to get book counts
          }))
        };
      })
    );
  }
  
  // Load collection details for a full dashboard
  // This loads more data, so use only when needed
  getDetailedStatistics(): Observable<any> {
    return this.getStatistics().pipe(
      switchMap(basicStats => {
        // Get collection details for each collection to get book counts
        if (basicStats.totalCollections === 0) {
          return of({...basicStats, collectionStats: []});
        }
        
        // Get details for each collection (which includes books)
        const collectionDetailObservables = basicStats.collectionSummary.map((collection: any) => 
          this.collectionService.getCollectionDetails(collection.collectionId).pipe(
            catchError(() => of(null))
          )
        );
        
        return forkJoin([
          of(basicStats),
          forkJoin(collectionDetailObservables).pipe(catchError(() => of([])))
        ]);
      }),
      map(([basicStats, collectionDetails]) => {
        // Filter out null values and map to summary format
        const collectionStats = collectionDetails
          .filter((detail: any) => detail !== null)
          .map((detail: any) => ({
            name: detail.name,
            bookCount: detail.books?.length || 0
          }));
        
        return {
          ...basicStats,
          collectionStats
        };
      })
    );
  }
  
  private countByProperty(items: any[], property: string): {[key: string]: number} {
    return items.reduce((acc, item) => {
      const value = item[property] || 'Unknown';
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }
  
  private getCreationActivity(conversations: any[], books: any[]): any[] {
    // Combine conversations and books with their creation dates
    const allItems = [
      ...conversations.map(c => ({ type: 'conversation', date: new Date(c.createdAt) })),
      ...books.map(b => ({ type: 'book', date: new Date(b.createdAt) }))
    ];
    
    // Group by month
    return this.groupByMonth(allItems);
  }
  
  private groupByMonth(items: any[]): any[] {
    const months: {[key: string]: {conversations: number, books: number}} = {};
    
    items.forEach(item => {
      if (!item.date) return;
      
      const monthKey = `${item.date.getFullYear()}-${item.date.getMonth() + 1}`;
      
      if (!months[monthKey]) {
        months[monthKey] = { conversations: 0, books: 0 };
      }
      
      if (item.type === 'conversation') {
        months[monthKey].conversations += 1;
      } else {
        months[monthKey].books += 1;
      }
    });
    
    // Convert to array sorted by date
    return Object.entries(months)
      .map(([key, value]) => ({ 
        month: key, 
        ...value 
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}