/* 
*  This file is part of the Unity networking tutorial by M2H (http://www.M2H.nl)
*  The original author of this code is Mike Hergaarden, even though some small parts 
*  are copied from the Unity tutorials/manuals.
*  Feel free to use this code for your own projects, drop us a line if you made something exciting! 
*/
#pragma strict
#pragma implicit
#pragma downcast

var skin : GUISkin;

//static var newRecordMessage : String = "";

private var displayingHighscore : boolean = false;
private var highscoreText : GUIText;

private var playerName : String = "";

private var scoreText : String = "Loading scores";

private var hidestats : boolean = true;
private var scoreBoardHeight :int = 60;
private var gameSetupScript : GameSetup;

function Awake(){
	gameSetupScript = GetComponent(GameSetup);
	
	highscoreText = GetComponent(GUIText);
	highscoreText.enabled=false;
	playerName= PlayerPrefs.GetString("playerName");
}

function OnGUI () {
	GUI.skin = skin;

	scoreText = "Scoreboard:\n";
	for(var entry : FPSPlayerNode in  gameSetupScript.playerList){
		scoreText += entry.playerName+" \t"+entry.kills+" kills "+entry.deaths+" deaths\n";		
	}

	GUILayout.BeginArea (Rect ((Screen.width-185),20,175,scoreBoardHeight));
	GUILayout.Box(scoreText);
	GUILayout.EndArea ();
}


function LocalPlayerHasKilled(){
	var kills : int =0;
	var deaths : int = 0;
	for (var playerInstance : FPSPlayerNode in gameSetupScript.playerList) {
		if (Network.player == playerInstance.networkPlayer) {
			kills = playerInstance.kills;
			deaths = playerInstance.deaths;
			break;
		}
	}
	
	kills++;
	
	//Overwrite the data of other players with the new correct score
	networkView.RPC("UpdateScore",RPCMode.All, Network.player, kills, deaths); 
}

function LocalPlayerDied(){
	var kills : int =0;
	var deaths : int = 0;
	for (var playerInstance : FPSPlayerNode in gameSetupScript.playerList) {
		if (Network.player == playerInstance.networkPlayer) {
			kills = playerInstance.kills;
			deaths = playerInstance.deaths;
			break;
		}
	}	
	deaths++;
	
	//Overwrite with new correct score
	networkView.RPC("UpdateScore",RPCMode.All, Network.player, kills, deaths); 
}

		
@RPC
function UpdateScore(player : NetworkPlayer, kills : int, deaths : int){
	Debug.Log((Network.player==player)+"=local "+kills+"kills & deaths="+deaths);
	var found : boolean = false;
	for (var playerInstance : FPSPlayerNode in gameSetupScript.playerList) {
		if (player == playerInstance.networkPlayer) {
			playerInstance.kills=kills;
			playerInstance.deaths=deaths;
			found=true;
			break;			
		}
	}	
	if(!found){
		Debug.LogError("Could not find network player "+player+" in the gamesetup playerlist!");
	}
	scoreBoardHeight = gameSetupScript.playerList.Count*15+40;		
}