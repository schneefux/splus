export interface ISource {
    getData(weekOfYear: number): PromiseLike<string>;
}
