import findLast from 'lodash/findLast';
import { DateTime, Interval } from 'luxon';
import {
	NoDataReason,
	type Birthday,
	type BirthdayNumberOnes,
	type ChartData
} from './birthday-number-ones';

const chartJsonUrl =
	'https://raw.githubusercontent.com/mattmarch/birthday-playlist/refs/heads/chart-data/charts.json';

type IncomingChartEntry = {
	first_week_ending_date: string;
	title: string;
	artist: string;
	weeks_at_number_one: string;
};

export const getChartData: () => Promise<ChartData> = async () => {
	const response = await fetch(chartJsonUrl);
	const incomingEntries = await response.json();
	return incomingEntries.map((entry: IncomingChartEntry) => ({
		firstWeekEndDate: DateTime.fromISO(entry.first_week_ending_date),
		title: entry.title,
		artist: entry.artist,
		weeksAtNumberOne: Number(entry.weeks_at_number_one)
	}));
};

export const findBirthdayNumberOnes = (
	birthdayDate: Date,
	chartData: ChartData
): BirthdayNumberOnes =>
	Interval.fromDateTimes(DateTime.fromJSDate(birthdayDate), DateTime.local())
		.splitBy({ years: 1 })
		.filter((interval): interval is Interval<true> => interval.isValid)
		.map((interval) => findBirthdayNumberOne(interval.start, chartData));

export const findBirthdayNumberOne = (birthday: DateTime, chartData: ChartData): Birthday => {
	const chartEntryBeforeBirthday = findLast(
		chartData,
		(entry) => entry.firstWeekEndDate.minus({ days: 6 }) <= birthday // Date is last day of first week, so subtract 6 days to get beginning
	);
	if (chartEntryBeforeBirthday === undefined) {
		return {
			date: birthday,
			numberOne: null,
			reason: NoDataReason.DATE_TOO_OLD
		};
	} else if (
		// if entry is final entry
		chartEntryBeforeBirthday === chartData[chartData.length - 1] &&
		// and birthday is past chart start plus weeks at number one
		birthday >=
			chartEntryBeforeBirthday.firstWeekEndDate.plus({
				weeks: chartEntryBeforeBirthday.weeksAtNumberOne,
				days: -6
			})
	) {
		return {
			date: birthday,
			numberOne: null,
			reason: NoDataReason.NO_DATA_YET
		};
	} else {
		return {
			date: birthday,
			numberOne: chartEntryBeforeBirthday,
			reason: null
		};
	}
};
