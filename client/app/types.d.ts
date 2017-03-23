
export interface IAgency {
    ratingAgencyCode: string,
    ratingAgencyDescription: string,
    termLength: string,
    ratings: IRating[]
}

export interface IRating {
    RatingAgencyCD: string,
    RatingCD: string,
    RatingDesc: string,
    RatingValue: number
}