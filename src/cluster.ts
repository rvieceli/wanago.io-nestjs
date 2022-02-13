import * as _cluster from 'cluster';
import * as os from 'os';

//FIX ME:
const cluster = _cluster as unknown as _cluster.Cluster;

export class Cluster {
  static register(workers: number, bootstrap: () => Promise<void>): void {
    if (!cluster.isPrimary) {
      bootstrap();
      return;
    }

    console.log(`Principal started on ${process.pid}`);

    process.on('SIGINT', () => {
      for (const id in cluster.workers) {
        cluster.workers[id].kill();
      }

      process.exit(0);
    });

    const cpus = Math.min(os.cpus().length, workers);

    for (let i = 0; i < cpus; i++) {
      cluster.fork();
    }

    cluster.on('online', (worker) => {
      console.log(`Worker ${worker.process.pid} is online`);
    });

    cluster.on('exit', (worker) => {
      console.log(`Worker ${worker.process.pid} off. Restarting...`);
      cluster.fork();
    });
  }
}
