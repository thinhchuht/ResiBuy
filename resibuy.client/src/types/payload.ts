export interface creatUserPayload {
    code? : string,
    email? : string,
    phoneNumber: string,
    password?: string,
    fullName: string,
    dateOfBirth: Date,
    identityNumber: string,
    roomIds: string[]
}