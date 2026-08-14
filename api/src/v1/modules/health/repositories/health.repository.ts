export abstract class HealthRepository {
  abstract pingDatabase(): Promise<void>;
}
