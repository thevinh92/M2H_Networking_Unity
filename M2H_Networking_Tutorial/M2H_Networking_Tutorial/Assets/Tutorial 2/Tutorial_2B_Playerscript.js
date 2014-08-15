/* 
*  This file is part of the Unity networking tutorial by M2H (http://www.M2H.nl)
*  The original author of this code Mike Hergaarden, even though some small parts 
*  are copied from the Unity tutorials/manuals.
*  Feel free to use this code for your own projects, drop me a line if you made something exciting! 
*/
#pragma strict
#pragma implicit
#pragma downcast

function Awake(){
	if(!networkView.isMine){
		//We aren't the network owner, disable this script
		//RPC's and OnSerializeNetworkView will STILL get trough!
		enabled=false;	
	}
}

function Update(){
	
	if(networkView.isMine){
		//Only the owner can move the cube!			
		var moveDirection : Vector3 = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
		var speed : float = 5;
		transform.Translate(speed * moveDirection * Time.deltaTime);
	}
	
}


function OnSerializeNetworkView(stream : BitStream, info : NetworkMessageInfo)
{
	if (stream.isWriting){
		//Executed on the owner of the networkview; 
		//The server sends it's position over the network
		
		var pos : Vector3 = transform.position;		
		stream.Serialize(pos);//"Encode" it, and send it
				
	}else{
		//Executed on the others; 
		//The clients receive a position and set the object to it
		
		var posReceive : Vector3 = Vector3.zero;
		stream.Serialize(posReceive); //"Decode" it and receive it
		transform.position = posReceive;
		
	}
}