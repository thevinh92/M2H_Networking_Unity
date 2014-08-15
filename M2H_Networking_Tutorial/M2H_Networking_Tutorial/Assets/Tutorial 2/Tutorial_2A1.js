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
	
	//Only run this on the server
	if(Network.isServer){
		//Only the server can move the cube!			
		var moveDirection : Vector3 = new Vector3(-1*Input.GetAxis("Vertical"), 0,Input.GetAxis("Horizontal"));
		var speed : float = 5;
		transform.Translate(speed * moveDirection * Time.deltaTime);//now really move!
	}
	
}