/* 
*  This file is part of the Unity networking tutorial by M2H (http://www.M2H.nl)
*  The original author of this code is Mike Hergaarden, even though some small parts 
*  are copied from the Unity tutorials/manuals.
*  Feel free to use this code for your own projects, drop us a line if you made something exciting! 
*/
#pragma strict
#pragma implicit
#pragma downcast

private var myTrans : Transform;
public var rotateSpeed : int = 20;

function Awake(){
	myTrans=transform;
}

function Update () {
	myTrans.Rotate(Vector3(Time.deltaTime*rotateSpeed,0,0));
}