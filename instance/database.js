import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let db = null;

if (Platform.OS !== 'web' && SQLite?.openDatabase) {
  db = SQLite.openDatabase('database.db');
} else {
  console.warn('SQLite is not available on this platform.');
}

export default db;
console.log('SQLite:', SQLite);
console.log('SQLite.openDatabase:', SQLite.openDatabase);
