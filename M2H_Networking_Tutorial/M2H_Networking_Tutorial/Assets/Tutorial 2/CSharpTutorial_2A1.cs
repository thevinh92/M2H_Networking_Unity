using UnityEngine;
using System.Collections;

public class CSharpTutorial_2A1 : MonoBehaviour {

	// Use this for initialization
	void  Update ()
	{
		
		//Only run this on the server
		if(Network.isServer)
		{
			//Only the server can move the cube!			
			Vector3 moveDirection = new Vector3(-1*Input.GetAxis("Vertical"), 0,Input.GetAxis("Horizontal"));
			float speed = 5;
			transform.Translate(speed * moveDirection * Time.deltaTime);//now really move!
		}
		
	}
}
