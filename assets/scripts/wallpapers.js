// NOTES:
// 1) the base URL is https://www.reddit.com/r/
// 2) you can combine multiple subreddits into one reddit by going to
// https://www.reddit.com/r/subreddit[1]+subreddit[2]+...+subreddit[n]
// 3) then you add on one of ['hot','new','top','controversial','rising']
// 4) ".json&count=N" on the end of the URL turns it into .json data with N results
// 5) adding "&after=" does... ????

// Notes On JSON Data:
// json data path: data.data.children[i].data
// useful JSON Object properties, with examples:

// title: "[/r/ImaginaryWeather] Dread by Laurens Spruit"
// subreddit: "ImaginaryBestOf"
// subreddit_name_prefixed: "r/ImaginaryBestOf"
// thumbnail: https://b.thumbs.redditmedia.com/JZQmIjA29r469t4E3hB3BqNNLSVmTSB02vhHwBgZntA.jpg
// author: "Lol33ta"
// id: a string which is used to get the 2nd page of json results
// num_comments: 2
// *permalink: "/r/ImaginaryBestOf/comments/etta1f/rimaginaryweather_dread_by_laurens_spruit/"
// *url: "https://cdnb.artstation.com/p/assets/images/images/023/070/047/large/laurens-spruit-drex-by-laurensspruit-dboniti-fullview.jpg"

// NOTES: How to send a custom UserAgent in javaScript
// https://stackoverflow.com/questions/23248525/setting-a-custom-useragent-in-html-or-javascript
// FOLLOW THE RULES: https://github.com/reddit-archive/reddit/wiki/API
navigator.__defineGetter__("userAgent", function() {
	return "Chrome:rolands_wallpaper_app:v0.0.1 (by /u/Roly__Poly__)";
});

const subreddits = [
	"Art",
	"ImaginaryBestOf",
	"ImaginaryCityscapes",
	"ImaginarySliceOfLife",
	"ImaginaryStarships",
	"ImaginaryColorscapes",
	"ImaginaryDragons",
	"ImaginaryHellscapes",
	"ImaginaryArchitecture",
	"ImaginaryAngels",
	"ImaginaryBeasts",
	"wallpaper",
	"wallpapers",
	"widescreenwallpaper",
	"WQHD_Wallpaper"
];

const sortingOptions = ["hot", "new", "top", "controversial", "rising"];
const jsonify = ".json?count=";
const afterConst = "&after=";
const beforeConst = "&before=";
const resultsPerPage = 25;

const imageExtensions = [".jpg", "jpeg", ".png", ".gif", "gify", "gifv"];

let startURL =
	"https://www.reddit.com/r/" +
	subreddits.join("+") +
	"/" +
	sortingOptions[0] +
	jsonify +
	resultsPerPage +
	afterConst;

const startURL2 = "https://www.reddit.com/r/wallpaper/hot.json?count=25";

const startURL3 =
	"https://www.reddit.com/r/wallpaper/hot.json?count=25&after=t3_ettxi4";

let displayURL; // as in data.data.children[i].data.url
let title; // thread title
let resolution;
let subreddit; // name of the subreddit where the img was posted
let page = 1; //
let after; // aka "Next Page"
let before; // aka "Prev Page"

let currentSubreddit = "";

const mainDiv = document.getElementById("list-of-wallpapers");

// default loader
changeSubreddit(startURL);

// axios
// 	.get(startURL3)
// 	.then(res => {
// 		after = res.data.data.after;
// 		console.log("after:", after);
// 		let html = [`<div class="flexbox-container">`];
// 		for (let i = 0; i < resultsPerPage; i++) {
// 			displayURL = res.data.data.children[i].data.url;
// 			title = res.data.data.children[i].data.title;
// 			// get the image resolution
// 			resolution =
// 				res.data.data.children[i].data.preview.images[0].source.width +
// 				"x" +
// 				res.data.data.children[i].data.preview.images[0].source.height;
// 			subreddit = res.data.data.children[i].data.subreddit;
// 			let wallpaper = `
// 	        <div class="card">
// 	            <img class="thumbnail" src=${displayURL} alt="Image not loaded yet" />
// 				<br/>
// 				<div class="card-container">
// 	            	<a href=${displayURL}>${title}</a>
// 	            	<p>Resolution: ${resolution}</p>
// 					<p>Posted on: ${subreddit}</p>
// 				</div>
// 	        </div>
// 	    `;
// 			html.push(wallpaper);
// 		}
// 		html.push(`</div>`);
// 		mainDiv.innerHTML = html.join("");
// 	})
// 	.catch(err => {
// 		console.log("Error in changeSubreddit():", err);
// 	});

// render the Subreddit Choices links
let subParentDiv = document.getElementById("subreddit-selector");
let selectable = [];
for (let i = 0; i < subreddits.length; i++) {
	let append = `
		<div><p class="subreddit-selection">r/${subreddits[i]}</p></div>
	`;
	selectable.push(append);
}
subParentDiv.innerHTML = selectable.join("");

// add the changeSubreddit event listeners to each button
const subButtons = document.getElementsByClassName("subreddit-selection");
for (let i = 0; i < subButtons.length; i++) {
	subButtons[i].addEventListener(
		"click",
		changeSubreddit.bind(null, subButtons[i].innerHTML)
	);
	// bind the ith value so highlight() can pick which value to highlight later
	subButtons[i].addEventListener("click", highlight.bind(null, i));
}

function changeSubreddit(choice, selectedPage = 1) {
	// changes the wallpapers to images from the subreddit of the user's choice
	// accepts 1 arg, the name of a subreddit.
	// TODO: make changeSubreddit() accept a 2nd arg, sortingOption.

	// TODO: b) Do some kinda error handling (An Alert, maybe)
	mainDiv.innerHTML = `<p>Loading...</p>`;
	// without these lines & func call, when changing Subreddits while after page1, buttons and page do not reset to "page1 && next"
	let incomingSubreddit = storeCurrentSubreddit(choice);
	if (incomingSubreddit !== currentSubreddit) {
		resetButtons();
	}

	let newSubreddit = "";
	// console.log("choice:", choice);
	if (typeof choice === "string") {
		if (choice.substring(0, 2) === "r/") {
			// This if block is for the case where changeSubreddit() is being used by the Change Subreddit Buttons.
			console.log(choice.substring(2));
			newSubreddit =
				"https://www.reddit.com/r/" +
				choice.substring(2) +
				"/" +
				sortingOptions[0] +
				jsonify +
				resultsPerPage;
		} else if (choice.substring(0, 4) === "http") {
			// This if block is for the case where changeSubreddit() is being used by the default loader.
			newSubreddit = choice;
		}
	} else if (choice.target.value) {
		// This if block is for the case where changeSubreddit() is being used by the search box.
		// Because this value comes in as an event from input onchange, subreddit.target.value is required.
		newSubreddit =
			"https://www.reddit.com/r/" +
			choice.target.value +
			"/" +
			sortingOptions[0] +
			jsonify +
			resultsPerPage;
	}
	axios
		.get(newSubreddit)
		.then(res => {
			// store the after data so it can be combined into a URL later
			after = res.data.data.after;
			before = res.data.data.before;
			console.log("after:", after);
			// store current Subreddit so it can be combined into a URL later
			currentSubreddit = storeCurrentSubreddit(newSubreddit); // accepts the URL as an argument and parses the input
			let html = [`<div class="flexbox-container">`];
			for (let i = 0; i < resultsPerPage; i++) {
				displayURL = res.data.data.children[i].data.url;
				// setting up for "if (testCondition === 0)", which will avoid loading any non-image Reddit links
				let testCondition = 0;
				let skipCondition = false;
				for (let i = 0; i < imageExtensions.length; i++) {
					if (displayURL.includes(imageExtensions[i])) {
						// we keep "testCondition" at 0 if and only if the displayURL does not include any imageExtensions
						testCondition++;
					}
				}
				// if the displayURL doesn't match any extension, jump to next loop & skip adding a new wallpaper
				if (testCondition === 0) {
					continue;
				}
				// get the image resolution
				try {
					resolution =
						res.data.data.children[i].data.preview.images[0].source
							.width +
						"x" +
						res.data.data.children[i].data.preview.images[0].source
							.height;
				} catch {
					resolution = "Unknown";
				}
				title = res.data.data.children[i].data.title;
				subreddit = res.data.data.children[i].data.subreddit;
				// add a new wallpaper
				let wallpaper = `
	        <div class="card">
	            <img class="thumbnail" src=${displayURL} alt="Image not loaded yet" />
				<br/>
				<div class="card-container">
	            	<a href=${displayURL}>${title}</a>
	            	<p>Resolution: ${resolution}</p>
					<p>Posted on: ${subreddit}</p>
				</div>
	        </div>
	    `;
				html.push(wallpaper);
			}
			html.push(`</div>`);
			mainDiv.innerHTML = html.join("");
		})
		.catch(err => {
			console.log("Error in changeSubreddit():", err);
		});
}

function nextPage(currentPage, nextPage) {
	// nextPage(arg1, arg2) should take the user to currentSubreddit arg2
	page = page + 1;
	newSubreddit =
		"https://www.reddit.com/r/" +
		currentSubreddit + // from global variables
		"/" +
		sortingOptions[0] +
		jsonify +
		resultsPerPage +
		afterConst +
		after; // from global variables

	changeSubreddit(newSubreddit);

	const buttonContainer = document.getElementById("button-container");
	buttonContainer.innerHTML = `
	<button id="prev-button" onclick="prevPage()">Previous</button>
	<p>Page ${page}</p>
	<button id="next-button" onclick="nextPage()">Next</button>
	`;
}

function prevPage() {
	page = page - 1;
	newSubreddit =
		"https://www.reddit.com/r/" +
		currentSubreddit + // from global variables
		"/" +
		sortingOptions[0] +
		jsonify +
		resultsPerPage +
		beforeConst +
		before; // from global variables

	changeSubreddit(newSubreddit);

	const buttonContainer = document.getElementById("button-container");
	if (page === 1) {
		buttonContainer.innerHTML = `
		<button id="next-button" onclick="nextPage()">Next</button>
	`;
	} else if (page > 1) {
		buttonContainer.innerHTML = `
		<button id="prev-button" onclick="prevPage()">Previous</button>
		<p>Page ${page}</p>
		<button id="next-button" onclick="nextPage()">Next</button>
	`;
	} else {
		console.log("You shouldn't be able to get here you know.", page);
	}
}

function storeCurrentSubreddit(subredditURL) {
	// remove the domain;
	let removedDomain = subredditURL.substring(25);
	// get the index of the slash following the subreddits list;
	const indexOfSubredditsEnd = removedDomain.indexOf("/");
	// remove the stuff following the slash.
	let justSubreddits = removedDomain.substring(0, indexOfSubredditsEnd);
	// console.log("JUST:", justSubreddits);
	return justSubreddits;
}

function resetButtons() {
	page = 1;
	const buttonContainer = document.getElementById("button-container");
	buttonContainer.innerHTML = `
	<button id="next-button" onclick="nextPage()">Next</button>
	`;
}

function highlight(number) {
	for (let i = 0; i < subButtons.length; i++) {
		if (subButtons[i].classList.contains("selected")) {
			subButtons[i].classList.remove("selected");
		}
	}
	subButtons[number].classList.add("selected");
}

// GOAL: a website that looks like https://droidheat.com/r-wallpapers/ ("like", not "the same as")
// TODO: Show "Loading..." on pageload

// TODO: CENTER THE DAMN NEXT AND PREV PAGE BUTTONS

// ********************************************************************************************
// ********************************************************************************************

// Create the JS for making and unmaking a dropdown box
// TODO: Figure out how to make this hover instead of pushing the content down...
// const dropdown = document.getElementById("subreddit-selector");

// function createDropdownBox() {
// 	dropdown.addEventListener("click", removeDropdownBox);
// 	let selectable = [];
// 	for (let i = 0; i < subreddits.length; i++) {
// 		selectable.push(`
// 		<div class="dropdown show"><p>r/${subreddits[i]}</p></div>
// 	`);
// 	}
// 	dropdown.innerHTML += selectable.join("");
// 	dropdown.removeEventListener("click", createDropdownBox);
// }

// function removeDropdownBox() {
// 	dropdown.addEventListener("click", createDropdownBox);
// 	dropdown.innerHTML = `<p>Pick A Subreddit</p>`;
// }

// dropdown.addEventListener("click", createDropdownBox);
