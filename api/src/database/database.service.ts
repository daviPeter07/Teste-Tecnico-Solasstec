export abstract class DatabaseService {
  abstract ping(): Promise<void>;
}
