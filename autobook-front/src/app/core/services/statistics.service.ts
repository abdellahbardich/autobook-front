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
    return this.conversationService.getConversations().pipe(
      switchMap(conversations => {
        const bookObservables = conversations.map(conversation => 
          this.bookService.getBooksInConversation(conversation.conversationId).pipe(
            catchError(() => of([]))
          )
        );
        
        return forkJoin([
          of(conversations),
          forkJoin(bookObservables).pipe(catchError(() => of([]))),
          this.collectionService.getCollections().pipe(catchError(() => of([])))
        ]);
      }),
      map(([conversations, booksArrays, collections]) => {
        const allBooks = booksArrays.flat();
        
        return {
          totalConversations: conversations.length,
          totalBooks: allBooks.length,
          totalCollections: collections.length,
          
          booksByType: this.countByProperty(allBooks, 'bookType'),
          
          booksByStatus: this.countByProperty(allBooks, 'status'),
          
          creationActivity: this.getCreationActivity(conversations, allBooks),
          
          collectionSummary: collections.map(collection => ({
            name: collection.name,
          }))
        };
      })
    );
  }
  
  getDetailedStatistics(): Observable<any> {
    return this.getStatistics().pipe(
      switchMap(basicStats => {
        if (basicStats.totalCollections === 0) {
          return of({...basicStats, collectionStats: []});
        }
        
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
    const allItems = [
      ...conversations.map(c => ({ type: 'conversation', date: new Date(c.createdAt) })),
      ...books.map(b => ({ type: 'book', date: new Date(b.createdAt) }))
    ];
    
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
    
    return Object.entries(months)
      .map(([key, value]) => ({ 
        month: key, 
        ...value 
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}