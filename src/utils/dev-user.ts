function userIsDev(userId: string): boolean {
    const devIds = process.env.DEV_USER_GROUP;
    const devList = devIds?.substring(1, devIds.length - 1).split(',') ?? [];
    const devUser = devList.find((str) => str == userId);
    return Boolean(devUser);
}

export { userIsDev };