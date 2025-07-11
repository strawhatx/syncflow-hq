import Bottleneck from 'bottleneck';

// Create a limiter with a max of 5 requests per second
export const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 200 // 200ms between requests
});