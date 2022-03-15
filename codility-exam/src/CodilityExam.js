import { html, css, LitElement } from 'lit';
// import axios from "axios";

export class CodilityExam extends LitElement {
	static get styles() {
		return css`
			/* parent */
			:host {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				padding-top: 2rem;
				gap: 2rem;
			}

			.search--input {
				border-radius: 1rem;
			}

			/* items */
			.show--container {
				display: flex;
				width: 100%;
				flex-flow: row wrap;
				justify-content: center;
				gap: 2rem;
			}

			.show--child {
				display: flex;
				gap: 0.5rem;
				background-color: #ececec;
				border-radius: 15px;
				box-shadow: 10px 5px #888888;
				overflow: hidden;
				cursor: pointer;
			}
			
			.show--child > div {
				display: flex;
				flex-direction: column;
				width: 150px;
				min-width: 250px;
				height: 350px;
				padding-top: 2rem;
				gap: 0.5rem;
			}

			.show--child > div > h5, h4 {
				margin: 0;
			}

			.summary--detail > p {
				margin: 5px;
				overflow: hidden;
				display: -webkit-box;
				-webkit-line-clamp: 3;
				-webkit-box-orient: vertical;
			}

			/* item details dialog */
			.wrapper:not(.open) {
				visibility: hidden;
			}

			.wrapper.open {
				align-items: center;
				display: flex;
				justify-content: center;
				height: 100vh;
				position: fixed;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				opacity: 1;
				visibility: visible;
			}

			.content {
				display: flex;
				min-height: 400px;
				min-width: 500px;
			}

			.content > div {
				padding: 0 2rem;
				display: inherit;
				flex-direction: column;
			}

			.dialog {
				background: #ffffff;
				max-width: 600px;
				padding: 1rem;
				position: fixed;
				border-radius: 15px;
			}
			.overlay {
				background: rgba(0, 0, 0, 0.8);
				height: 100%;
				position: fixed;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				width: 100%;
			}

			button {
				all: unset;
				cursor: pointer;
				font-size: 1.25rem;
				position: absolute;
				top: 1rem;
				right: 1rem;
			}
		`;
	}

	static get properties() {
		return {
			title: { 
				type: String 
			},

			counter: { 
				type: Number 
			},

			value: {
				type: String
			},

			tvShows: {
				type: Array
			},

			showDetails: {
				type: Array
			},
			open: { type: Boolean, attribute: 'open', reflect: true }
		};
	}

	constructor() {
		super();
		let ref = this;

		ref.showDetails = [];
		ref.tvShows 	= [];
		ref.onLoad();
	}

	onLoad() {
		let ref = this;

		fetch('https://api.tvmaze.com/search/shows?q=a').then((response) => response.json()).then((responseJSON) => {
		   ref.tvShows = responseJSON;
		});
	}

	onChangeHandler(e) {
		let ref = this;
		let searchInput = e.target.value;

		if(e.target.value == "") {
			searchInput = "a"
		}

		fetch('https://api.tvmaze.com/search/shows?q=' + searchInput).then((response) => response.json()).then((responseJSON) => {
		   ref.tvShows = responseJSON;
		});
	}

	showMovieDetail(item) {
		let ref = this;

		ref.showDetails = item;
		ref.open 		= true;
	}

	closeDialog() {
		let ref = this;

		ref.open = false;
	}

	render() {
		let ref = this;
		const itemTemplates 	= [];
		const dialogTemplate 	= [];

		if(ref.tvShows.length > 0) {
			for (const item of ref.tvShows) {
				let rating 	= "No Rating Yet"
				let image 	= "../src/images/no-image-available.jpeg";
				let frag 	= document.createRange().createContextualFragment(`${item.show.summary}`)
	
				if(item.show.image != null) {
					image 	= item.show.image.medium;
				}
				
				if(item.show.rating.average != null) {
					rating 	= item.show.rating.average + "/10";
				}
	
				itemTemplates.push(html`
					<div class="show--child" @click=${() => this.showMovieDetail(item)}>
						<img class="image--box" src="${image}" alt="image">
						<div class="summary--detail">
							<label>
								<b>${item.show.name}</b>
							</label>
							<label>
								<b>Rating:</b> ${rating}
							</label>
							${frag}
						</div>
					</div>
				`);
			}
		} else {
				itemTemplates.push(html`
					<h1>TV Show not found.</h1>
				`);
		}
      
		let dialogImage = "../src/images/no-image-available.jpeg";
		let showDetails = ref.showDetails;

		if(showDetails.show != undefined) {
			let frag = document.createRange().createContextualFragment(`${showDetails.show.summary}`)

			if(showDetails.show.image != null) {
				dialogImage = showDetails.show.image.medium;
			}

			dialogTemplate.push(html`
				<div class="wrapper ${this.open ? 'open' : ''}" aria-hidden="${!this.open}">
					<div class="overlay"></div>
					<div class="dialog" role="dialog" aria-labelledby="title" aria-describedby="content">
						<button class="close" aria-label="Close" @click=${this.closeDialog}>✖️</button>
						<h1 id="title"><slot name="heading"></slot></h1>
						<div id="content" class="content">
							<img class="image--box" src="${dialogImage}" alt="image">
							<div>
								<h2>${showDetails.show.name}</h2>
								${frag}
							</div>
						</div>
					</div>
				</div>
			`);
		}
		

		return html`
			<div>
				<input class="search--input" placeholder="Search TV shows" @change=${this.onChangeHandler}>
			</div>
			<div class="show--container">
				${itemTemplates}
			</div>
			${dialogTemplate}
		`;
	}
}
