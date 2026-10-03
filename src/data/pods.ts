export type PodStatus = 'Running' | 'CrashLoopBackOff' | 'Pending' | 'Completed'

export interface Pod {
  name: string
  namespace: string
  status: PodStatus
  restarts: number
  age: string
  image: string
}

export const INITIAL_PODS: Pod[] = [
  {
    name: 'api-gateway-7d4f9b',
    namespace: 'production',
    status: 'CrashLoopBackOff',
    restarts: 4,
    age: '12m',
    image: 'api-gateway:v2.3.1',
  },
  {
    name: 'auth-service-5c8df2',
    namespace: 'production',
    status: 'Running',
    restarts: 0,
    age: '3h',
    image: 'auth-service:v1.8.0',
  },
  {
    name: 'payment-worker-b91ae4',
    namespace: 'production',
    status: 'Running',
    restarts: 0,
    age: '3h',
    image: 'payment-worker:v3.1.0',
  },
  {
    name: 'analytics-cron-6f2bc1',
    namespace: 'production',
    status: 'Completed',
    restarts: 0,
    age: '47m',
    image: 'analytics:v2.0.4',
  },
]
