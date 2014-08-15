/* 
*  This file is part of the Unity networking tutorial by M2H (http://www.M2H.nl)
*  The original author of this code is Mike Hergaarden, even though some small parts 
*  are copied from the Unity tutorials/manuals.
*  Feel free to use this code for your own projects, drop us a line if you made something exciting! 
*/
#pragma strict
#pragma implicit
#pragma downcast


function OnGUI () {
	
	GUILayout.BeginArea(Rect(Screen.width/2-200,0,400,Screen.height));
	
	GUILayout.FlexibleSpace();	
	
	GUILayout.BeginHorizontal();
	GUILayout.FlexibleSpace();	
	GUILayout.Label("Unity Networking; the Zero to Hero guide");
	GUILayout.FlexibleSpace();
	GUILayout.EndHorizontal();
	
	GUILayout.Space(10);
	
	GUILayout.BeginHorizontal();
	
	
	
	GUILayout.BeginVertical();
	if(GUILayout.Button("Tutorial 1 - Connect")){
		Application.LoadLevel(1);
	}
	
	GUILayout.Space(10);
	
	if(GUILayout.Button("Tutorial 2A1 - Observe transform")){
		Application.LoadLevel(2);
	}
	if(GUILayout.Button("Tutorial 2A2 - Observe code")){
		Application.LoadLevel(3);
	}
	if(GUILayout.Button("Tutorial 2A3 - RPC")){
		Application.LoadLevel(4);
	}
	if(GUILayout.Button("Tutorial 2B - Instantiating")){
		Application.LoadLevel(5);
	}
	
	GUILayout.Space(10);
	
	if(GUILayout.Button("Tutorial 3 - Authoritative server")){
		Application.LoadLevel(6);
	}
	GUILayout.EndVertical();
	
	GUILayout.Space(30);
	
	GUILayout.BeginVertical();
	if(GUILayout.Button("Example 1 - Chat")){
		Application.LoadLevel(7);
	}
	if(GUILayout.Button("Example 2 - Masterserver")){
		Application.LoadLevel(8);
	}
	if(GUILayout.Button("Example 3 - Lobby")){
		Application.LoadLevel(10);
	}
	if(GUILayout.Button("Example 4 - FPS game")){
		Application.LoadLevel(12);
	}
	GUILayout.EndVertical();
	
	
	GUILayout.EndHorizontal();
	GUILayout.FlexibleSpace();
	GUILayout.EndArea();
	
}