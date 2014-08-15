/* 
*  This file is part of the Unity networking tutorial by M2H (http://www.M2H.nl)
*  The original author of this code Mike Hergaarden, even though some small parts 
*  are copied from the Unity tutorials/manuals.
*  Feel free to use this code for your own projects, drop me a line if you made something exciting! 
*/
#pragma strict
#pragma implicit
#pragma downcast

function Update(){
	
	if(Network.isServer){
		//Only the server can move the cube!			
		var moveDirection : Vector3 = new Vector3(-1*Input.GetAxis("Vertical"), 0,Input.GetAxis("Horizontal"));
		var speed : float = 5;
		transform.Translate(speed * moveDirection * Time.deltaTime);
	}
	
}


function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo)
{
	if (stream.isWriting){
		//Executed on the owner of the networkview; in this case the Server
		//The server sends it's position over the network
		
		var pos : Vector3 = transform.position;		
		stream.Serialize(pos);//"Encode" it, and send it
		
		/*
		var jumpBoolean = Input.GetButton ("Jump");
		stream.Serialize(jumpBoolean);
		*/
		
	}else{
		//Executed on the others; in this case the Clients
		//The clients receive a position and set the object to it
		
		var posReceive : Vector3 = Vector3.zero;
		stream.Serialize(posReceive); //"Decode" it and receive it
		transform.position = posReceive;
		
		/*
		var jumpBoolean = false;
		stream.Serialize(jumpBoolean);
		if(jumpBoolean){
			Debug.Log(We are jumping");
		}
		*/
	}
}