export interface creatUserPayload {
    phoneNumber: string,
    password: string,
    fullName: string,
    dateOfBirth: Date,
    identityNumber: string,
    roles: string[],
    roomIds: string[]
}