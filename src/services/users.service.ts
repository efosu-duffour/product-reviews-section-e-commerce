import { ProductID } from "./products.service";

export type User = {
  name: string;
  user_id: string;
  avatar_url: string | null;
};

const SESSIONNAME = "sn-users";
export class UserService {
  createdAt?: number;
  private _users?: User[];
  private _USERSAPI = import.meta.env.BASE_URL + "data/users.json";

  constructor() {
    if (UserService._INSTANCE) return UserService._INSTANCE;
    else {
      this.createdAt = Date.now();
      UserService._INSTANCE = this;
    }
  }

  async init(): Promise<User[]> {
    // Fetches the users from server or cache
    if (this._users) return this._users;
    let users: User[] = [];

    const cachedUsers = sessionStorage.getItem(SESSIONNAME);
    if (cachedUsers && cachedUsers.length !== 0) {
      users = JSON.parse(cachedUsers);
    } else {
      users = await this._fetchUsers();
      sessionStorage.setItem(SESSIONNAME, JSON.stringify(users));
    }

    return (this._users = users);
  }

  private async _fetchUsers(): Promise<User[]> {
    // Fetches users json from cache if not fetch from server, cache and store it in the local variable
    let fetchedUsers: User[] = [];
    try {
      const response = await fetch(this._USERSAPI);
      const json: User[] = await response.json();
      fetchedUsers = json;
    } catch (err: unknown) {
      console.warn(err);
    }

    return fetchedUsers;
  }

  get users(): User[] {
    return this._users ?? [];
  }


  private static _INSTANCE: UserService | null = null;
}
