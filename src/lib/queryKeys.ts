export const queryKeys = {
  workers: {
    all:      ['workers']                                                       as const,
    list:     (search?: string, available?: boolean) =>
                ['workers', 'list', { search, available }]                      as const,
    infinite: (search?: string, available?: boolean) =>
                ['workers', 'infinite', { search, available }]                  as const,
    detail:   (id: string) =>
                ['workers', 'detail', id]                                       as const,
  },
  reviews: {
    all:      ['reviews']                                                       as const,
    byWorker: (workerId: string) =>
                ['reviews', 'worker', workerId]                                 as const,
  },
  bookings: {
    all:          ['bookings']                                                  as const,
    my:           ['bookings', 'my']                                            as const,
    workerOrders: ['bookings', 'worker-orders']                                 as const,
    detail:       (id: string) => ['bookings', 'detail', id]                   as const,
  },
} as const;
