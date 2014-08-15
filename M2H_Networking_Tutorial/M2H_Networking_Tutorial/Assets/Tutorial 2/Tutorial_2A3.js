/* 
*  This file is part of the Unity networking tutorial by M2H (http://www.M2H.nl)
*  The original author of this code Mike Hergaarden, even though some small parts 
*  are copied from the Unity tutorials/manuals.
*  Feel free to use this code for your own projects, drop me a line if you made something exciting! 
*/
#pragma strict
#pragma implicit
#pragma downcast

private var lastPosition : Vector3;

function Update(){
	
	if(Network.isServer){
		//Only the server can move the cube!			
		var moveDirection : Vector3 = new Vector3(-1*Input.GetAxis("Vertical"), 0,Input.GetAxis("Horizontal"));
		var speed : float = 5;
		transform.Translate(speed * moveDirection * Time.deltaTime);
		
		//Save some network bandwidth; only send an rpc when the position has moved more than X
		if(Vector3.Distance(transform.position, lastPosition)>=0.05){
			lastPosition=transform.position;
			
			//Send the position Vector3 over to the others; in this case all clients
			networkView.RPC("SetPosition", RPCMode.Others, transform.position);
		}
	}
	
}


@RPC
function SetPosition(newPos : Vector3){
	//This RPC is in this case always called by the server,
	// but executed on all clients
	
	transform.position=newPos;	
}
