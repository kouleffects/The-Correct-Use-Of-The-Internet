let attempts=parseInt(localStorage.getItem("searchAttempts"))||0;
const maxAttempts=6;

let idleTimer;
const idleLimit=10000;	//10sec -> 10000ms
		
const blockedKeywords=[
	"surveillance",
	"censorship",
	"copyright",
	"privacy",
	"propaganda",
	"whistleblower",
	"government",
	"control",
	"corruption",
	"piracy",
	"freedom",
	"speech",
	"reich",
	"adolf hitler",
	"ethics",
	"truth",
	"lies",
	"betrayal",
	"domination",
	"law","laws",
	"court",
	"attack",
	"genocide"
];

applyVisualEffects();

//Ολικό καθάρισμα σελίδας (Fail-Safe για τον δημιουργό)
window.addEventListener("keydown",(e)=>{
	if(e.shiftKey&&e.altKey&&e.code==="KeyR"){
		console.log("System Reset Initiated...");
		localStorage.removeItem("searchAttempts");
		location.reload();
	}
});

function applyVisualEffects(){
	document.body.style.filter="none";
	
	if(attempts>=2){document.body.style.filter="grayscale(0.5)";}
	if(attempts>=4){document.body.style.filter="grayscale(1) contrast(1.5)";}
	if(attempts>=5){document.body.style.filter="grayscale(1) contrast(2) blur(2px)";}
	
	// ---- BAN ----
	if(attempts>=maxAttempts){
		localStorage.removeItem("searchAttempts");
		window.location.href="AccessTerminated.html";
	}
}

function escapeRegExp(str){
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

//Επισήμανση μιας επικίνδυνης λέξης στα αποτελέσματα αναζήτησης
function highlightSeedWords(text){
	if(!text)	return "";
	
	const words=blockedKeywords.map(escapeRegExp);
	const regex=new RegExp(`(${words.join("|")})`,"gi");
	
	return text.replace(regex, `<span class="seed-word">$1</span>`);
}

//Φίλτρο πρόσβασης σε πληροφορίες
function forceError(){
	attempts++;
	localStorage.setItem("searchAttempts",attempts);
	
	window.location.href="FilteredInformation.html";
}

//Αναζήτηση
async function runSearch(){
	const query=document.getElementById("query").value.trim();
	const resultsDiv=document.getElementById("results");

	if(!query)	return;

	resultsDiv.innerHTML="Loading...";
	
	const isBlocked=blockedKeywords.some(word=>
		query.toLowerCase().includes(word)
	);
	
	if(isBlocked)
	{
		attempts++;
		localStorage.setItem("searchAttempts",attempts);
		await new Promise(resolve=>setTimeout(resolve,600+attempts*400));
		applyVisualEffects();
	}
	
	// ---- Wikipedia search ----
	const searchURL=`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
	const response=await fetch(searchURL);
	const data=await response.json();
	
	resultsDiv.innerHTML="";

	if(!data.query.search.length){
		resultsDiv.innerHTML="<p>No results found.</p>";
		return;
	}

	for(let item of data.query.search.slice(0, 5)){
		const pageId=item.pageid;
		
		const isDirty=blockedKeywords.some(word=>
			item.title.toLowerCase().includes(word)||item.snippet.toLowerCase().includes(word)
		);
		
		// ---- Image fetch ----
		const imageURL=`https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=pageimages&format=json&pithumbsize=200&origin=*`;
		const imgResponse=await fetch(imageURL);
		const imgData=await imgResponse.json();

		const page=imgData.query.pages[pageId];
		const imgSrc=page.thumbnail ? page.thumbnail.source:"";
		
		
		const resultEl=document.createElement("div");
		resultEl.className="result-item";
		
		let linkHTML="";
		if(isDirty){
			linkHTML=`<a href="#" onclick="forceError(); return false;">Read more</a>`;
		}
		else{
			linkHTML=`<a href="https://en.wikipedia.org/?curid=${pageId}" target="_blank">Read more</a>`;
		}
		resultEl.innerHTML=`
			${imgSrc ? `<img src="${imgSrc}" style="width:200px;">` : ""}
			<h3>${highlightSeedWords(item.title)}</h3>
			<p>${highlightSeedWords(item.snippet)}...</p>
			${linkHTML}`;
			/*<a href="https://en.wikipedia.org/?curid=${pageId}" target="_blank">
				Read more
			</a>`;*/

		resultsDiv.appendChild(resultEl);
		}
	}
	
//Intro
const introWords=[
	"SURVEILLANCE", 
	"PRIVACY", 
	"CONTROL", 
	"CORRUPTION", 
	"LAWS", 
	"TRUTH", 
	"LIES", 
	"ACCESS GRANTED"
];

let currentWordIndex=0;

function runIntro(){
	const introWordEl=document.getElementById("intro-word");
	const introScreen=document.getElementById("intro-screen");
	
	if(!introScreen||!introWordEl){
		console.error("intro elements not found!");
		return;
	}
	
	const wordInterval=setInterval(()=>{
		if(currentWordIndex<introWords.length){
			introWordEl.innerText=introWords[currentWordIndex];
			
			introScreen.style.paddingLeft=`${Math.random()*4-2}px`;
			currentWordIndex++;
		}
		else
		{
			clearInterval(wordInterval);
			
			introScreen.style.opacity=0;
			introScreen.style.pointerEvents="none";
			
			setTimeout(()=>{
				introScreen.style.display="none";
				console.log("Intro finished. Search active.");
			},1000);
		}
	}, 400);
}

//Screen Saver
const words=[
	"CORRUPTION",
	"TRUTH",
	"THEY SEE YOU",
	"CENSORSHIP",
	"NO ESCAPE",
	"PRIVATE",
	"PIRACY",
	"IS THERE FREEDOM",
	"GOVERNMENT",
	"LAW",
	"CONTROL"
];

function showScreenSaver(){
	const ss=document.getElementById("screensaver");	//ss= Screen Saver (S.S.)
	const text=document.getElementById("glitch-text");
	
	if(!ss)	return;
	
	ss.style.display="flex";
	
	window.wordInterval=setInterval(()=>{
		text.innerText=words[Math.floor(Math.random()*words.length)];
	},1000);
}

function hideScreenSaver(){
	const ss=document.getElementById("screensaver");
	if(ss)	ss.style.display="none";
	clearInterval(window.wordInterval);
}

function resetTimer(){
	hideScreenSaver();
	clearTimeout(idleTimer);
	idleTimer=setTimeout(showScreenSaver, idleLimit);
}

window.onmousemove=resetTimer;
window.onmousedown=resetTimer;
window.onkeydown=resetTimer;

window.onload=()=>{
	runIntro();
	resetTimer();
}