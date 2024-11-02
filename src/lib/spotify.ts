import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';
import type { Birthday, BirthdayNumberOnes, SpotifyTrack } from './birthday-number-ones';

const baseUrl = 'https://api.spotify.com/v1';

export type SpotifyProfile = {
	id: string;
	displayName: string;
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

	public login = (date?: string): Promise<void> => this.userManager.signinRedirect({ state: date });

	public loginCallback = (): Promise<User> => this.userManager.signinRedirectCallback();

	public logout = (): Promise<void> => this.userManager.removeUser();

	public isLoggedIn = (): Promise<boolean> => this.getUser().then((user) => !!user);

	public getProfile = async (): Promise<SpotifyProfile | null> => {
		const profile = await fetch(`${baseUrl}/me`, {
			headers: await this.getHeaders()
		});
		const { id, display_name } = await profile.json();
		return { id, displayName: display_name };
	};

	public populateSpotifyInfo = async (
		birthdays: BirthdayNumberOnes
	): Promise<BirthdayNumberOnes> => {
		return Promise.all(birthdays.map((birthday) => this.addSpotifyTrackInfo(birthday)));
	};

	public createPlaylist = async (
		birthdays: BirthdayNumberOnes,
		profileId: string
	): Promise<string> => {
		const birthday = birthdays[0].date;
		const playlist = await fetch(`${baseUrl}/users/${profileId}/playlists`, {
			method: 'POST',
			headers: await this.getHeaders(true),
			body: JSON.stringify({
				name: `Birthday Playlist - ${birthday.toLocaleString()}`,
				description:
					'Playlist of Birthday UK Number One singles created via https://playlist.mattmarch.co.uk'
			})
		});
		const {
			id: playlistId,
			external_urls: { spotify: playlistUrl }
		} = await playlist.json();
		const uris = birthdays
			.map((birthday) => birthday.numberOne?.spotifyTrack?.uri)
			.filter((uri): uri is string => !!uri);
		await fetch(`${baseUrl}/playlists/${playlistId}/tracks`, {
			method: 'POST',
			headers: await this.getHeaders(true),
			body: JSON.stringify({ uris })
		});
		return playlistUrl;
	};

	private getUser = (): Promise<User | null> => this.userManager.getUser();
	private getHeaders = async (contentTypeForPost?: boolean): Promise<Headers> => {
		const user = await this.getUser();
		if (!user) {
			throw new Error('User is not logged in');
		}
		return new Headers({
			Authorization: `Bearer ${user.access_token}`,
			...(contentTypeForPost ? { 'Content-Type': 'application/json' } : {})
		});
	};

	private searchTrack = async (title: string, artist: string): Promise<SpotifyTrack | null> => {
		const firstArtist = artist.split(/ FT. | FEATURING | WITH THE |\/| & /)[0];
		const firstTrack = title.split('/')[0];
		const queryParameters = new URLSearchParams({
			q: `"${firstTrack}" "${firstArtist}"`,
			type: 'track',
			limit: '1'
		});
		const response = await fetch(`${baseUrl}/search?${queryParameters.toString()}`, {
			headers: await this.getHeaders()
		});
		const json = await response.json();
		return json.tracks.items.length > 0 ? json.tracks.items[0] : null;
	};

	private addSpotifyTrackInfo = async (birthdayEntry: Birthday): Promise<Birthday> => {
		if (!birthdayEntry.numberOne) {
			return birthdayEntry;
		}
		if (birthdayEntry.numberOne.spotifyTrack) {
			throw new Error('Spotify track already exists');
		}
		const spotifyTrack = await this.searchTrack(
			birthdayEntry.numberOne.title,
			birthdayEntry.numberOne.artist
		);
		if (!spotifyTrack) {
			return birthdayEntry;
		}
		return { ...birthdayEntry, numberOne: { ...birthdayEntry.numberOne, spotifyTrack } };
	};
}
