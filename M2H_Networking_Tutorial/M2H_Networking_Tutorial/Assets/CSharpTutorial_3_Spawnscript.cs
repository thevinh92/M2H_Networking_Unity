// Converted from UnityScript to C# at http://www.M2H.nl/files/js_to_c.php - by Mike Hergaarden
// Do test the code! You usually need to change a few small bits.

using UnityEngine;
using System.Collections;

public class CSharpTutorial_3_Spawnscript : MonoBehaviour {
	/* 
*  This file is part of the Unity networking tutorial by M2H (http://www.M2H.nl)
*  The original author of this code is Mike Hergaarden, even though some small parts 
*  are copied from the Unity tutorials/manuals.
*  Feel free to use this code for your own projects, drop us a line if you made something exciting! 
*/
	
	
	
	
	
	public Transform playerPrefab;
	public ArrayList playerScripts = new ArrayList();
	
	void  OnServerInitialized (){
		//Spawn a player for the server itself
		Spawnplayer(Network.player);
	}
	
	void  OnPlayerConnected ( NetworkPlayer newPlayer  ){
		//A player connected to me(the server)!
		Spawnplayer(newPlayer);
	}	
	
	
	void  Spawnplayer ( NetworkPlayer newPlayer  ){
		//Called on the server only
		
		int playerNumber = int.Parse(newPlayer+"");
		//Instantiate a new object for this player, remember; the server is therefore the owner.
		Transform myNewTrans = ((GameObject)Network.Instantiate(playerPrefab, transform.position, transform.rotation, playerNumber)).transform;
		
		//Get the networkview of this new transform
		NetworkView newObjectsNetworkview = myNewTrans.networkView;
		
		//Keep track of this new player so we can properly destroy it when required.
		playerScripts.Add(myNewTrans.GetComponent<CSharpTurorial_3_Playerscript>());
		
		//Call an RPC on this new networkview, set the player who controls this player
		newObjectsNetworkview.RPC("SetPlayer", RPCMode.AllBuffered, newPlayer);//Set it on the owner
	}
	
	
	
	void  OnPlayerDisconnected ( NetworkPlayer player  ){
		Debug.Log("Clean up after player " + player);
		
		foreach(CSharpTurorial_3_Playerscript script in playerScripts){
			if(player == script.owner){//We found the players object
				Network.RemoveRPCs(script.gameObject.networkView.viewID);//remove the bufferd SetPlayer call
				Network.Destroy(script.gameObject);//Destroying the GO will destroy everything
				playerScripts.Remove(script);//Remove this player from the list
				break;
			}
		}
		
		//Remove the buffered RPC call for instantiate for this player.
		int playerNumber = int.Parse(player+"");
		Network.RemoveRPCs(Network.player, playerNumber);
		
		
		// The next destroys will not destroy anything since the players never
		// instantiated anything nor buffered RPCs
		Network.RemoveRPCs(player);
		Network.DestroyPlayerObjects(player);
	}
	
	void  OnDisconnectedFromServer ( NetworkDisconnection info  ){
		Debug.Log("Resetting the scene the easy way.");
		Application.LoadLevel(Application.loadedLevel);	
	}
	
}