export type Alias = {
    text: string;
    userId: string;
    values: string[];
};

export type AliasList = {
    userAliases: Alias[];
    otherAliases: Alias[];
};
