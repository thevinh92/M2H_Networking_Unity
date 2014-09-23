// Converted from UnityScript to C# at http://www.M2H.nl/files/js_to_c.php - by Mike Hergaarden
// Do test the code! You usually need to change a few small bits.

using UnityEngine;
using System.Collections;

public class CSharpChat : MonoBehaviour {
	/* 
*  This file is part of the Unity networking tutorial by M2H (http://www.M2H.nl)
*  The original author of this code is Mike Hergaarden, even though some small parts 
*  are copied from the Unity tutorials/manuals.
*  Feel free to use this code for your own projects, drop us a line if you made something exciting! 
*/
	
	
	
	
	
	public bool  usingChat = false;	//Can be used to determine if we need to stop player movement since we're chatting
	public GUISkin skin;						//Skin
	public bool  showChat= false;			//Show/Hide the chat
	
	//Private vars used by the script
	private string inputField= "";
	
	private Vector2 scrollPosition;
	private int width= 500;
	private int height= 180;
	private string playerName;
	private float lastUnfocusTime =0;
	private Rect window;
	
	//Server-only playerlist
	private ArrayList playerList= new ArrayList();
	class PlayerNode {
		string playerName;

		public string PlayerName {
			get {
				return playerName;
			}
			set {
				playerName = value;
			}
		}

		NetworkPlayer networkPlayer;

		public NetworkPlayer NetworkPlayer {
			get {
				return networkPlayer;
			}
			set {
				networkPlayer = value;
			}
		}
	}
	
	private ArrayList chatEntries= new ArrayList();
	class ChatEntry
	{
		string name= "";

		public string Name {
			get {
				return name;
			}
			set {
				name = value;
			}
		}

		string text= "";	

		public string Text {
			get {
				return text;
			}
			set {
				text = value;
			}
		}
	}
	
	void  Awake (){
		window = new Rect(Screen.width/2-width/2, Screen.height-height+5, width, height);
		
		//We get the name from the masterserver example, if you entered your name there ;).
		playerName = PlayerPrefs.GetString("playerName", "");
		if(playerName == null || playerName==""){
			playerName = "RandomName"+Random.Range(1,999);
		}	
		
	}
	
	
	//Client function
	void  OnConnectedToServer (){
		ShowChatWindow();
		networkView.RPC ("TellServerOurName", RPCMode.Server, playerName);
		// //We could have also announced ourselves:
		// addGameChatMessage(playerName" joined the chat");
		// //But using "TellServer.." we build a list of active players which we can use for other stuff as well.
	}
	
	//Server function
	void  OnServerInitialized (){
		ShowChatWindow();
		//I wish Unity supported sending an RPC on the server to the server itself :(
		// If so; we could use the same line as in "OnConnectedToServer();"
		PlayerNode newEntry = new PlayerNode();
		newEntry.PlayerName = playerName;
		newEntry.NetworkPlayer = Network.player;
		playerList.Add(newEntry);	
		addGameChatMessage(playerName+" joined the chat");
	}
	
	//A handy wrapper function to get the PlayerNode by networkplayer
	PlayerNode  GetPlayerNode ( NetworkPlayer networkPlayer  ){
		foreach(PlayerNode entry in  playerList){
			if(entry.NetworkPlayer==networkPlayer){
				return entry;
			}
		}
		Debug.LogError("GetPlayerNode: Requested a playernode of non-existing player!");
		return null;
	}
	
	
	//Server function
	void  OnPlayerDisconnected ( NetworkPlayer player  ){
		addGameChatMessage("Player disconnected from: " + player.ipAddress+":" + player.port);
		
		//Remove player from the server list
		playerList.Remove( GetPlayerNode(player) );
	}
	
	void  OnDisconnectedFromServer (){
		CloseChatWindow();
	}
	
	//Server function
	void  OnPlayerConnected ( NetworkPlayer player  ){
		addGameChatMessage("Player connected from: " + player.ipAddress +":" + player.port);
	}
	
	[RPC]
	//Sent by newly connected clients, recieved by server
	void  TellServerOurName ( string name ,   NetworkMessageInfo info  ){
		PlayerNode newEntry = new PlayerNode();
		newEntry.PlayerName=name;
		newEntry.NetworkPlayer=info.sender;
		playerList.Add(newEntry);
		
		addGameChatMessage(name+" joined the chat");
	}
	
	
	
	
	void  CloseChatWindow (){
		showChat = false;
		inputField = "";
		chatEntries = new ArrayList();
	}
	
	void  ShowChatWindow (){
		showChat = true;
		inputField = "";
		chatEntries = new ArrayList();
	}
	
	void  OnGUI (){
		if(!showChat){
			return;
		}
		
		GUI.skin = skin;		
		
		if (Event.current.type == EventType.keyDown && Event.current.character.ToString() == "\n" && inputField.Length <= 0)
		{
			if(lastUnfocusTime+0.25f<Time.time){
				usingChat=true;
				GUI.FocusWindow(5);
				GUI.FocusControl("Chat input field");
			}
		}
		
		window = GUI.Window (5, window, GlobalChatWindow, "");
	}
	
	
	void  GlobalChatWindow ( int id  ){
		
		GUILayout.BeginVertical();
		GUILayout.Space(10);
		GUILayout.EndVertical();
		
		// Begin a scroll view. All rects are calculated automatically - 
		// it will use up any available screen space and make sure contents flow correctly.
		// This is kept small with the last two parameters to force scrollbars to appear.
		scrollPosition = GUILayout.BeginScrollView (scrollPosition);
		
		foreach(ChatEntry entry in chatEntries)
		{
			GUILayout.BeginHorizontal();
			if(entry.Name==""){//Game message
				GUILayout.Label (entry.Text);
			}else{
				GUILayout.Label (entry.Name+": "+entry.Text);
			}
			GUILayout.EndHorizontal();
			GUILayout.Space(3);
			
		}
		// End the scrollview we began above.
		GUILayout.EndScrollView ();
		
		if (Event.current.type == EventType.keyDown && Event.current.character.ToString() == "\n" && inputField.Length > 0)
		{
			HitEnter(inputField);
		}
		GUI.SetNextControlName("Chat input field");
		inputField = GUILayout.TextField(inputField);
		
		
		if(Input.GetKeyDown("mouse 0")){
			if(usingChat){
				usingChat=false;
				GUI.UnfocusWindow ();//Deselect chat
				lastUnfocusTime=Time.time;
			}
		}
	}
	
	void  HitEnter ( string msg  ){
		msg = msg.Replace("\n", "");
		networkView.RPC("ApplyGlobalChatText", RPCMode.All, playerName, msg);
		inputField = ""; //Clear line
		GUI.UnfocusWindow ();//Deselect chat
		lastUnfocusTime=Time.time;
		usingChat=false;
	}
	
	
	[RPC]
	void  ApplyGlobalChatText ( string name ,   string msg  ){
		ChatEntry entry= new ChatEntry();
		entry.Name = name;
		entry.Text = msg;
		
		chatEntries.Add(entry);
		
		//Remove old entries
		if (chatEntries.Count > 4){
			chatEntries.RemoveAt(0);
		}
		
		scrollPosition.y = 1000000;	
	}
	
	//Add game messages etc
	void  addGameChatMessage ( string str  ){
		ApplyGlobalChatText("", str);
		if(Network.connections.Length>0){
			networkView.RPC("ApplyGlobalChatText", RPCMode.Others, "", str);	
		}	
	}
}
