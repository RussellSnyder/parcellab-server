import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { omit, pick, uniqBy } from 'lodash';
import { PrismaService } from '../prisma/prisma.service';
import { TrackingFromCsv, loadSeedData } from '../scripts/parseSeedData';

const articleKeys = ['article_number', 'articleImageUrl', 'product_name'];

@Injectable()
export class SeederService {
  constructor(private readonly prisma: PrismaService) {}

  async seed() {
    const { checkpoints, trackings: orders } = await loadSeedData();

    // In the future, we should dynamically create users based on emails in the parsed data
    // for now, we just add julian in
    const julian = await this.prisma.user.create({
      data: {
        email: 'julian@parcellab.com',
      },
    });

    //////// ORDER
    // match the data keys to whats in the database and remove unneeded data
    const normalizedOrders = this.normalizeOrders(orders);

    // there may be 2 orders that differ only by the article data
    // we want only one order per order number so we will not allow duplicates
    const createOrderData = uniqBy(normalizedOrders, 'order_number');

    await this.prisma.order.createMany({
      data: createOrderData.map((entry) => ({
        ...entry,
        customerId: julian.id,
      })),
    });

    //////// ARTICLE
    const createArticleData = this.normalizeArticles(orders)
      // Sometimes there is no article number
      .filter((article) => article.article_number);

    await this.prisma.article.createMany({
      data: createArticleData,
    });

    //////// ORDER ITE
    const articleQuantities = orders.map((order) => order.quantity);

    const createOrderItemData = normalizedOrders
      .map(({ order_number }, i) => ({
        quantity: Number(articleQuantities[i] ?? 0),
        order_number,
        article_number: orders[i]?.articleNo,
      }))
      // sometimes there are no articles in an order
      .filter((orderItem) => orderItem.article_number);

    await this.prisma.orderItem.createMany({
      data: createOrderItemData,
    });

    ////// CHECKPOINT
    await this.prisma.checkpoint.createMany({
      data: checkpoints,
    });
  }

  private normalizeOrders(orders): Prisma.OrderCreateManyInput[] {
    return orders.map((order) => {
      let normalizedOrder = { ...order };

      // convert the keys to database columns
      normalizedOrder.article_number = order.articleNo;
      normalizedOrder = omit(normalizedOrder, 'articleNo');
      normalizedOrder.order_number = order.orderNo;
      normalizedOrder = omit(normalizedOrder, 'orderNo');
      // remove article data from order
      normalizedOrder = omit(normalizedOrder, articleKeys);
      // remove orderItem data from order
      normalizedOrder = omit(normalizedOrder, ['quantity']);

      return normalizedOrder;
    });
  }

  private normalizeArticles(
    orders: TrackingFromCsv[],
  ): Prisma.ArticleCreateManyInput[] {
    return orders.map((order) => {
      const createArticleData = {
        ...pick(order, ['articleImageUrl', 'product_name']),
      };

      createArticleData.article_number = order.articleNo;

      return createArticleData;
    });
  }
}
