import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';
import type {
	Birthday,
	BirthdayNumberOnes,
	ChartData,
	ChartEntry,
	SpotifyTrack
} from './birthday-number-ones';

const baseUrl = 'https://api.spotify.com/v1';

export type SpotifyProfile = {
	id: string;
	displayName: string;
};

const searchTrack = async (
	title: string,
	artist: string,
	accessToken: string
): Promise<SpotifyTrack | null> => {
	const firstArtist = artist.split(/ FT. | FEATURING | WITH THE |\/| & /)[0];
	const firstTrack = title.split('/')[0];
	const queryParameters = new URLSearchParams({
		q: `"${firstTrack}" "${firstArtist}"`,
		type: 'track',
		limit: '1'
	});
	const response = await fetch(`${baseUrl}/search?${queryParameters.toString()}`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	const json = await response.json();
	return json.tracks.items.length > 0 ? json.tracks.items[0] : null;
};

const addSpotifyTrackInfo = async (
	birthdayEntry: Birthday,
	accessToken: string
): Promise<Birthday> => {
	if (!birthdayEntry.numberOne) {
		return birthdayEntry;
	}
	if (birthdayEntry.numberOne.spotifyTrack) {
		throw new Error('Spotify track already exists');
	}
	const spotifyTrack = await searchTrack(
		birthdayEntry.numberOne.title,
		birthdayEntry.numberOne.artist,
		accessToken
	);
	if (!spotifyTrack) {
		return birthdayEntry;
	}
	return { ...birthdayEntry, numberOne: { ...birthdayEntry.numberOne, spotifyTrack } };
};

export class SpotifyClient {
	private userManager: UserManager;

	constructor() {
		const location = window.location.origin;
		this.userManager = new UserManager({
			authority: 'https://accounts.spotify.com',
			client_id: '6c0a042391fa42e8ac96a5eed4306dfe',
			redirect_uri: `${location}/login-redirect`,
			scope: 'playlist-modify-public',
			post_logout_redirect_uri: location,
			automaticSilentRenew: true,
			silent_redirect_uri: `${location}/silent-renew`,
			stateStore: new WebStorageStateStore({ store: localStorage }),
			metadata: {
				issuer: 'https://accounts.spotify.com',
				authorization_endpoint: 'https://accounts.spotify.com/oauth2/v2/auth',
				token_endpoint: 'https://accounts.spotify.com/api/token',
				userinfo_endpoint: 'https://accounts.spotify.com/oidc/userinfo/v1',
				revocation_endpoint: 'https://accounts.spotify.com/oauth2/revoke/v1'
			}
		});
	}

	public login = (): Promise<void> => this.userManager.signinRedirect();

	public loginCallback = (): Promise<User> => this.userManager.signinRedirectCallback();

	public logout = (): Promise<void> => this.userManager.removeUser();

	public isLoggedIn = (): Promise<boolean> => this.getUser().then((user) => !!user);

	public getProfile = async (): Promise<SpotifyProfile | null> => {
		const user = await this.getUser();
		if (!user) {
			return null;
		}
		const profile = await fetch(`${baseUrl}/me`, {
			headers: { Authorization: `Bearer ${user.access_token}` }
		});
		const { id, display_name } = await profile.json();
		return { id, displayName: display_name };
	};

	public populateSpotifyInfo = async (
		birthdays: BirthdayNumberOnes
	): Promise<BirthdayNumberOnes> => {
		const user = await this.getUser();
		if (!user) {
			throw new Error('User is not logged in');
		}
		return Promise.all(
			birthdays.map((birthday) => addSpotifyTrackInfo(birthday, user.access_token))
		);
	};

	private getUser = (): Promise<User | null> => this.userManager.getUser();
}
