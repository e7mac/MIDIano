import { Render } from "./Rendering/Render.js"
import { Player } from "./Player.js"
import { UI } from "./ui/UI.js"
import { InputListeners } from "./InputListeners.js"

/**
 * TODOs:
 * - piano zoom
 * - channel menu
 * - accessability
 * - load from URL
 * - fix track ui
 * - added song info to "loaded songs"
 * - fix the minimize button
 * - add more starting colors
 * -
 *
 * - implement configurable ADSR + maybe custom wave functions
 * - make instrument choosable for tracks
 * -
 * - implement control messages of the other two pedals
 * -
 * - settings for playalong:
 * 		- accuracy needed
 * 		- different modes
 *
 *
 * - click piano = hit key
 * - render note keys on each note/ on piano
 * - Metronome
 */
var player, ui, player, loading, listeners


function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

window.onload = async function () {
	await init()
	loading = true


}

async function init() {
	player = new Player()
	console.log("Player created.")
	render = new Render(player)
	ui = new UI(player, render)
	listeners = new InputListeners(player, ui, render)
	drawIt()

	loadSongFromURL(getUrlVars()["url"])
}

var render
function drawIt() {
	let playerState = player.getState()
	render.render(playerState)
	window.requestAnimationFrame(drawIt)
}
async function loadSongFromFile() {
	let domain = window.location.href
	let url = "https://midiano.com/mz_331_3.mid?raw=true"
	if (domain.split("github").length > 1) {
		url = "https://Bewelge.github.io/MIDIano/mz_331_3.mid?raw=true"
	}

	loadSongFromURL(url, "Mozart KV 331 3rd Movement") // Local: "../mz_331_3.mid")
}
async function loadSongFromURL(url, title) {
	let response = fetch(url, {
		method: "GET" // *GET, POST, PUT, DELETE, etc.
	})
	let midi = document.getElementById('midi-player');
	midi.src = url;
	await (await response).blob().then(res => {
		let reader = new FileReader()
		let fileName = title || url.substring(url.lastIndexOf('/') + 1)
		reader.onload = function (theFile) {
			player.loadSong(reader.result, fileName, () => {})
		}
		reader.readAsDataURL(res)
	})
}
