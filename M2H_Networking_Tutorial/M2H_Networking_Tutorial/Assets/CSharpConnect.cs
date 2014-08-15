// Converted from UnityScript to C# at http://www.M2H.nl/files/js_to_c.php - by Mike Hergaarden
// Do test the code! You usually need to change a few small bits.

using UnityEngine;
using System.Collections;

public class CSharpConnect : MonoBehaviour {
	/* 
*  This file is part of the Unity networking tutorial by M2H (http://www.M2H.nl)
*  The original author of this code Mike Hergaarden, even though some small parts 
*  are copied from the Unity tutorials/manuals.
*  Feel free to use this code for your own projects, drop me a line if you made something exciting! 
*/
	
	
	
	
	public string connectToIP = "127.0.0.1";
	public int connectPort = 25001;
	
	
	//Obviously the GUI is for both client&servers (mixed!)
	void  OnGUI (){
		
		if (Network.peerType == NetworkPeerType.Disconnected){
			//We are currently disconnected: Not a client or host
			GUILayout.Label("Connection status: Disconnected");
			
			connectToIP = GUILayout.TextField(connectToIP, GUILayout.MinWidth(100));
			connectPort = int.Parse(GUILayout.TextField(connectPort.ToString()));
			
			GUILayout.BeginVertical();
			if (GUILayout.Button ("Connect as client"))
			{
				//Connect to the "connectToIP" and "connectPort" as entered via the GUI
				//Ignore the NAT for now
				
				Network.Connect(connectToIP, connectPort);
			}
			
			if (GUILayout.Button ("Start Server"))
			{
				//Start a server for 32 clients using the "connectPort" given via the GUI
				//Ignore the nat for now	
				
				Network.InitializeServer(32, connectPort);
			}
			GUILayout.EndVertical();
			
			
		}else{
			//We've got a connection(s)!
			
			
			if (Network.peerType == NetworkPeerType.Connecting){
				
				GUILayout.Label("Connection status: Connecting");
				
			} else if (Network.peerType == NetworkPeerType.Client){
				
				GUILayout.Label("Connection status: Client!");
				GUILayout.Label("Ping to server: "+Network.GetAveragePing(  Network.connections[0] ) );		
				
			} else if (Network.peerType == NetworkPeerType.Server){
				
				GUILayout.Label("Connection status: Server!");
				GUILayout.Label("Connections: "+Network.connections.Length);
				if(Network.connections.Length>=1){
					GUILayout.Label("Ping to first player: "+Network.GetAveragePing(  Network.connections[0] ) );
				}			
			}
			
			if (GUILayout.Button ("Disconnect"))
			{
				Network.Disconnect(200);
			}
		}
		
		
	}
	
	// NONE of the functions below is of any use in this demo, the code below is only used for demonstration.
	// First ensure you understand the code in the OnGUI() function above.
	
	//Client functions called by Unity
	void  OnConnectedToServer (){
		Debug.Log("This CLIENT has connected to a server");	
	}
	
	void  OnDisconnectedFromServer ( NetworkDisconnection info  ){
		Debug.Log("This SERVER OR CLIENT has disconnected from a server");
	}
	
	void  OnFailedToConnect ( NetworkConnectionError error  ){
		Debug.Log("Could not connect to server: "+ error);
	}
	
	
	//Server functions called by Unity
	void  OnPlayerConnected ( NetworkPlayer player  ){
		Debug.Log("Player connected from: " + player.ipAddress +":" + player.port);
	}
	
	void  OnServerInitialized (){
		Debug.Log("Server initialized and ready");
	}
	
	void  OnPlayerDisconnected ( NetworkPlayer player  ){
		Debug.Log("Player disconnected from: " + player.ipAddress+":" + player.port);
	}
	
	
	// OTHERS:
	// To have a full overview of all network functions called by unity
	// the next four have been added here too, but they can be ignored for now
	
	void  OnFailedToConnectToMasterServer ( NetworkConnectionError info  ){
		Debug.Log("Could not connect to master server: "+ info);
	}
	
	void  OnNetworkInstantiate ( NetworkMessageInfo info  ){
		Debug.Log("New object instantiated by " + info.sender);
	}
	
	void  OnSerializeNetworkView ( BitStream stream ,   NetworkMessageInfo info  ){
		//Custom code here (your code!)
	}
	
	/* 
 The last networking functions that unity calls are the RPC functions.
 As we've added "OnSerializeNetworkView", you can't forget the RPC functions 
 that unity calls..however; those are up to you to implement.
 
 [RPC]
 void  MyRPCKillMessage (){
	//Looks like I have been killed!
	//Someone send an RPC resulting in this function call
 }
*/
	
	
	[RPC]
	void  Test (){}
}