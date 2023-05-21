import { Order } from '@prisma/client';

export interface OrderArticle {
  articleNumber: string;
  articleImageUrl: string;
  quantity: number;
  product_name: string;
}

export interface OrderWithArticles
  extends Omit<
    Order,
    'articleNo' & 'articleImageUrl' & 'quantity' & 'product_name'
  > {
  articles: OrderArticle[];
}
