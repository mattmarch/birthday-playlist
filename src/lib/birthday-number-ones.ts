import type { DateTime } from 'luxon';

export type BirthdayNumberOnes = Array<Birthday>;

export type Birthday = {
	date: DateTime;
	numberOne: ChartEntry | null;
	reason: NoDataReason | null;
};

export enum NoDataReason {
	NO_DATA_YET,
	DATE_TOO_OLD
}

export const noDataReasonStrings = {
	[NoDataReason.DATE_TOO_OLD]: 'Birthday precedes the start of the chart data',
	[NoDataReason.NO_DATA_YET]: 'No chart data yet available for this date'
};

export interface ChartEntry {
	firstWeekEndDate: DateTime;
	title: string;
	artist: string;
	weeksAtNumberOne: number;
	spotifyTrack?: SpotifyTrack;
}

export type ChartData = Array<ChartEntry>;

type SpotifyAlbumImage = {
	url: string;
	height: number;
	width: number;
};

type SpotifyArtist = { name: string };

export type SpotifyTrack = {
	album: {
		name: string;
		images: Array<SpotifyAlbumImage>;
	};
	external_urls: { spotify: string };
	artists: Array<SpotifyArtist>;
	id: string;
	name: string;
	uri: string;
};
