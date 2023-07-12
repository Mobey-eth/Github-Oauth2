/**
 * User
 * A User
 */
declare interface User {
    id?: number;
    email?: string | null;
    fullName?: string | null;
    provider?: string | null;
    providerId?: number | null;
    token?: string | null;
}
export { User };
