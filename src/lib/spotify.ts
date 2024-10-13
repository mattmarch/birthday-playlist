import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';

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
				end_session_endpoint: 'https://accounts.spotify.com/oauth2/revoke/v1'
			}
		});
	}

	public login = (): Promise<void> => this.userManager.signinRedirect();

	public loginCallback = (): Promise<User> => this.userManager.signinRedirectCallback();

	public logout = (): Promise<void> => this.userManager.signoutRedirect();

	public getUser = (): Promise<User | null> => this.userManager.getUser();
}
