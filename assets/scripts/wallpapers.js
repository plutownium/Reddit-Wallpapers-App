const testURL =
	"https://www.reddit.com/r/wallpapers+wallpaper+widescreenwallpaper+wqhd_wallpaper/hot.json?count=25";

const searchBar = document.getElementById("search-bar");

// NOTES:
// 1) the base URL is https://www.reddit.com/r/
// 2) you can combine multiple subreddits into one reddit by going to
// https://www.reddit.com/r/subreddit[1]+subreddit[2]+...+subreddit[n]
// 3) then you add on one of ['hot','new','top','controversial','rising']
// 4) ".json&count=N" on the end of the URL turns it into .json data with N results
// 5) adding "&after=" does... ????

// NOTES: How to send a custom UserAgent in javaScript
// https://stackoverflow.com/questions/23248525/setting-a-custom-useragent-in-html-or-javascript
// FOLLOW THE RULES: https://github.com/reddit-archive/reddit/wiki/API
// "Change your client's User-Agent string to something unique and descriptive"
navigator.__defineGetter__("userAgent", function() {
	return "Chrome:rolands_wallpaper_app:v0.0.1 (by /u/Roly__Poly__)";
});

const sortingOptions = ["hot", "new", "top", "controversial", "rising"];
const jsonify = ".json?count=";
const page = 25;

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
	"wallpapers"
];

const url =
	"https://www.reddit.com/r/" +
	subreddits[1] +
	"/" +
	sortingOptions[0] +
	jsonify +
	page;

// path: data.data.children[i].data
// useful JSON Object properties, with examples:

// title: "[/r/ImaginaryWeather] Dread by Laurens Spruit"
// subreddit: "ImaginaryBestOf"
// subreddit_name_prefixed: "r/ImaginaryBestOf"
// thumbnail: https://b.thumbs.redditmedia.com/JZQmIjA29r469t4E3hB3BqNNLSVmTSB02vhHwBgZntA.jpg
// .preview.images[0].source.url // does something...
// author: "Lol33ta"
// num_comments: 2
// *permalink: "/r/ImaginaryBestOf/comments/etta1f/rimaginaryweather_dread_by_laurens_spruit/"
// *url: "https://cdnb.artstation.com/p/assets/images/images/023/070/047/large/laurens-spruit-drex-by-laurensspruit-dboniti-fullview.jpg"

let displayURL; // as in data.data.children[i].data.url
let title; // thread title
// TODO: Figure out how to detect image resolution in JavaScript so I can automatically set the value here
let resolution;
let subreddit; // name of the subreddit where the img was posted
const mainDiv = document.getElementById("list-of-wallpapers");

axios.get(url).then(r => {
	// TODO: Loop over all 25 entries in .children and add each one to the mainDiv as .innerHTML all at once
	let html = [`<div class="flexbox-container">`];
	for (let i = 0; i < page; i++) {
		displayURL = r.data.data.children[i].data.url;
		title = r.data.data.children[i].data.title;
		resolution = "Placeholder Value";
		subreddit = r.data.data.children[i].data.subreddit;
		let wallpaper = `
            <div class="card">
                <img class="thumbnail" src=${displayURL} alt="Image not loaded yet" />
                <br/>
                <a href=${displayURL}>${title}</a>
                <p>Resolution: ${resolution}</p>
                <p>Posted on: ${subreddit}</p>
            </div>
        `;
		html.push(wallpaper);
	}
	html.push(`</div>`);
	mainDiv.innerHTML = html.join("");
});

changeSubreddit(subreddit) {
	// changes the wallpapers to images from the subreddit of the user's choice
	// accepts 1 arg, the name of a subreddit.
	// TODO: make changeSubreddit() accept a 2nd arg, sortingOption.
	const url =
		"https://www.reddit.com/r/" +
		subreddit +
		"/" +
		sortingOptions[0] +
		jsonify +
		page;
	axios.get(url).then(r => {
	let html = [`<div class="flexbox-container">`];
	for (let i = 0; i < page; i++) {
		displayURL = r.data.data.children[i].data.url;
		title = r.data.data.children[i].data.title;
		resolution = "Placeholder Value";
		subreddit = r.data.data.children[i].data.subreddit;
		let wallpaper = `
            <div class="card">
                <img class="thumbnail" src=${displayURL} alt="Image not loaded yet" />
                <br/>
                <a href=${displayURL}>${title}</a>
                <p>Resolution: ${resolution}</p>
                <p>Posted on: ${subreddit}</p>
            </div>
        `;
		html.push(wallpaper);
	}
	html.push(`</div>`);
	mainDiv.innerHTML = html.join("");
	})
}

// GOAL: a website that looks like https://droidheat.com/r-wallpapers/ ("like", not "the same as")
// TODO: Make the search bar work. onChange={changeSubreddit()}
// TODO: Show "Loading..." on pageload
// TODO: Make the app have PAGES where page2=json results pg 2