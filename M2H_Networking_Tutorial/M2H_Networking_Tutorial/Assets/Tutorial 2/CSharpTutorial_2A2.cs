using UnityEngine;
using System.Collections;

public class CSharpTutorial_2A2 : MonoBehaviour {

	void  Update ()
	{
		
		if(Network.isServer){
			//Only the server can move the cube!			
			Vector3 moveDirection = new Vector3(-1*Input.GetAxis("Vertical"), 0,Input.GetAxis("Horizontal"));
			float speed = 5;
			transform.Translate(speed * moveDirection * Time.deltaTime);
		}
		
	}
	
	
	void  OnSerializeNetworkView ( BitStream stream ,   NetworkMessageInfo info  )
	{
		if (stream.isWriting){
			//Executed on the owner of the networkview; in this case the Server
			//The server sends it's position over the network
			
			Vector3 pos = transform.position;		
			stream.Serialize(ref pos);//"Encode" it, and send it
			
			/*
		FIXME_VAR_TYPE jumpBoolean= Input.GetButton ("Jump");
		stream.Serialize(jumpBoolean);
		*/
			
		}else{
			//Executed on the others; in this case the Clients
			//The clients receive a position and set the object to it
			
			Vector3 posReceive = Vector3.zero;
			stream.Serialize(ref posReceive); //"Decode" it and receive it
			transform.position = posReceive;
			
			/*
		FIXME_VAR_TYPE jumpBoolean= false;
		stream.Serialize(jumpBoolean);
		if(jumpBoolean){
			Debug.Log(We are jumping");
		}
		*/
		}
	}
}