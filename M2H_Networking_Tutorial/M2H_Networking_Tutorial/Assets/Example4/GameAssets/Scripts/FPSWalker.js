/* 
*  This file is part of the Unity networking tutorial by M2H (http://www.M2H.nl)
*  The original author of this code is Mike Hergaarden, even though some small parts 
*  are copied from the Unity tutorials/manuals.
*  Feel free to use this code for your own projects, drop us a line if you made something exciting! 
*/
#pragma strict
#pragma implicit
#pragma downcast

var speed = 6.0;
var jumpSpeed = 8.0;
var gravity = 20.0;

private var moveDirection = Vector3.zero;
private var grounded : boolean = false;

function FixedUpdate() {
	if (grounded) {
		if(!FPSChat.usingChat){
			// We are grounded, so recalculate movedirection directly from axes
			moveDirection = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
			moveDirection = transform.TransformDirection(moveDirection);
			moveDirection *= speed;
		
			if (Input.GetButton ("Jump")) {
				moveDirection.y = jumpSpeed;
			}
		}
	}

	// Apply gravity
	moveDirection.y -= gravity * Time.deltaTime;
	
	// Move the controller
	var controller : CharacterController = GetComponent(CharacterController);
	var flags = controller.Move(moveDirection * Time.deltaTime);
	grounded = (flags & CollisionFlags.CollidedBelow) != 0;
}

//@script RequireComponent(CharacterController)