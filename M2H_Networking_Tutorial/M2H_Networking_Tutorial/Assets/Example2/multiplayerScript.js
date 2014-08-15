/* 
*  This file is part of the Unity networking tutorial by M2H (http://www.M2H.nl)
*  The original author of this code is Mike Hergaarden, even though some small parts 
*  are copied from the Unity tutorials/manuals.
*  Feel free to use this code for your own projects, drop us a line if you made something exciting! 
*/
#pragma strict
#pragma implicit
#pragma downcast

public var gameName = "Example2";
public var serverPort =  35001;

public var hostData : HostData[];

private var natCapable : ConnectionTesterStatus = ConnectionTesterStatus.Undetermined;
public var filterNATHosts = false;
private var probingPublicIP = false;
private var doneTestingNAT = false;
private var timer : float = 0.0;

private var hideTest = false;
private var testMessage = "Undetermined NAT capabilities";

private var tryingToConnectPlayNow : boolean = false;
public var tryingToConnectPlayNowNumber : int = 0;

private var remotePort : int[] = new int[3];
private var remoteIP : String[] = new String[3];
public var connectionInfo : String = "";

public var lastMSConnectionAttemptForcedNat : boolean= false;
private var NAToptionWasSwitchedForTesting : boolean = false;
private var officialNATstatus : boolean = true;
public var errorMessage : String = "";
private var lastPlayNowConnectionTime : float;

public var nowConnecting : boolean = false;

function Awake ()
{
	sortedHostList = new Array ();
	
	// Start connection test
	natCapable = Network.TestConnection();
		
	// What kind of IP does this machine have? TestConnection also indicates this in the
	// test results
	if (Network.HavePublicAddress()){
		Debug.Log("This machine has a public IP address");
	}else{
		Debug.Log("This machine has a private IP address");
	}	
	
	/* //If you dont want to use the Unity masterserver..
	Network.natFacilitatorIP = myMasterServerIP;
	Network.natFacilitatorPort = 11111;//Change this
	MasterServer.ipAddress = myMasterServerIP;
	MasterServer.port = 22222;//Change this
	Network.connectionTesterIP = myMasterServerIP;
	Network.connectionTesterPort = 33333;//Change this
	*/
	
	
}

function Start(){//must be in start because of coroutine
		
	yield WaitForSeconds(0.5);
	var tries : int=0;
	while(tries<=10){		
		if(hostData && hostData.length>0){
			//Waiting for hostData
		}else{
			FetchHostList(true);
		}
		yield WaitForSeconds(0.5);
		tries++;
	}
}


function OnFailedToConnectToMasterServer(info: NetworkConnectionError)
{
	//Yikes
}

function OnFailedToConnect(info: NetworkConnectionError)
{
	Debug.Log("FailedToConnect info:"+info);
	FailedConnRetry(info);		
}

function Connect(ip : String, port : int){
	// Enable NAT functionality based on what the hosts if configured to do	
	//lastMSConnectionAttemptForcedNat = usenat;
	
	Debug.Log("Connecting to "+ip+":"+port+" NAT:");
	Network.Connect(ip, port);		
	nowConnecting=true;	
}

//This second definition of Connect can handle the ip string[] passed by the masterserver
function Connect(ip : String[], port : int){
	// Enable NAT functionality based on what the hosts if configured to do	
	//lastMSConnectionAttemptForcedNat = usenat;
	
	Debug.Log("Connecting to "+ip[0]+":"+port+" NAT:");
	Network.Connect(ip, port);		
	nowConnecting=true;	
}

function StartHost(players : int, port : int){
	if(players<=1){
		players=1;
	}
	//Network.InitializeSecurity();
	Network.InitializeServer(players, port);
}

function OnConnectedToServer(){
	//Stop communication until in the game
	Network.isMessageQueueRunning = false;

	//Save these details so we can use it in the next scene
	PlayerPrefs.SetString("connectIP", Network.connections[0].ipAddress);
	PlayerPrefs.SetInt("connectPort", Network.connections[0].port);
}

function FailedConnRetry(info: NetworkConnectionError){
	if(info == NetworkConnectionError.InvalidPassword){
		mayRetry=false;
	}
	
	
	nowConnecting=false;
	
	//Quickplay
	if(tryingToConnectPlayNow){
		//Try again without NAT if we used NAT
		if(mayRetry && lastMSConnectionAttemptForcedNat){
			Debug.Log("Failed connect 1A: retry without NAT");
		
			remotePort[0]=serverPort;//Fall back to default server port
			Connect(remoteIP, remotePort[0]);
			lastPlayNowConnectionTime=Time.time;
		}else{
			//We didn't use NAT and failed
			Debug.Log("Failed connect 1B: Don't retry");
		
						
			//Connect to next playnow/quickplay host
			tryingToConnectPlayNowNumber++;
			tryingToConnectPlayNow=false;
		}
	}else{
		//Direct connect or via host list manually
		connectionInfo="Failed to connect!";
		
		if(mayRetry && lastMSConnectionAttemptForcedNat){
			//Since the last connect forced NAT usage,
			// let's try again without NAT.		
			Network.Connect(remoteIP, remotePort[0]);
			nowConnecting=true;
			lastPlayNowConnectionTime=Time.time;
			
		}else{
			Debug.Log("Failed 2b");
		
			if(info == NetworkConnectionError.InvalidPassword){
				errorMessage="Failed to connect: Wrong password supplied";
			}else if(info == NetworkConnectionError.TooManyConnectedPlayers){
				errorMessage="Failed to connect: Server is full";
			}else{
				errorMessage="Failed to connect";
			}
			
			//reset to default port
			remotePort[0]=serverPort;
			
			
		}
	}	
}

public var CONNECT_TIMEOUT : float = 0.75;
public var CONNECT_NAT_TIMEOUT : float = 5.00;

//Our quickplay function: Go trough the gameslist and try to connect to all games
function PlayNow(timeStarted : float ) : String {
	
		var i : int=0;
		
		for (var myElement in sortedHostList)
		{
			var element=hostData[myElement];
		
			// Do not try NAT enabled games if we cannot do NAT punchthrough
			// Do not try connecting to password protected games
			if ( !(filterNATHosts && element.useNat) && !element.passwordProtected  )
			{
				aHost=1;
								
				if(element.connectedPlayers<element.playerLimit)
				{					
					if(tryingToConnectPlayNow){
						var natText;
						if(( lastPlayNowConnectionTime+CONNECT_TIMEOUT<=Time.time) || ( lastPlayNowConnectionTime+CONNECT_NAT_TIMEOUT<=Time.time)){
							Debug.Log("Interrupted by timer");
							FailedConnRetry(NetworkConnectionError.ConnectionFailed);							
						}
						return "Trying to connect to host "+(tryingToConnectPlayNowNumber+1)+"/"+sortedHostList.length+" "+natText;	
					}		
					if(!tryingToConnectPlayNow && tryingToConnectPlayNowNumber<=i){
						Debug.Log("Trying to connect to game NR "+i+" & "+tryingToConnectPlayNowNumber);
						tryingToConnectPlayNow=true;
						tryingToConnectPlayNowNumber=i;
						
						// Enable NAT functionality based on what the hosts if configured to do
						lastMSConnectionAttemptForcedNat=element.useNat;
					
						var connectPort : int=element.port;
						print("Connecting directly to host");
						
						Debug.Log("connecting to "+element.gameName+" "+element.ip+":"+connectPort);
						Network.Connect(element.ip, connectPort);	
						lastPlayNowConnectionTime=Time.time;
					}
					i++;		
				}
			}			
		}
		
		//If we reach this point then either we've parsed the whole list OR the list is still empty
		
		//Dont give up yet: Give MS 7 seconds to feed the list
		if(Time.time<timeStarted+7){
			FetchHostList(true);	
			return "Waiting for masterserver..."+Mathf.Ceil((timeStarted+7)-Time.time);	
		}
		
		if(!tryingToConnectPlayNow){
			return "failed";
		}
		
	
}


function Update() {
	// If network test is undetermined, keep running
	if (!doneTestingNAT) {
		TestConnection();
	}
}

function TestConnection() {
	// Start/Poll the connection test, report the results in a label and react to the results accordingly
	natCapable = Network.TestConnection();
	switch (natCapable) {
		case ConnectionTesterStatus.Error: 
			testMessage = "Problem determining NAT capabilities";
			doneTestingNAT = true;
			break;
			
		case ConnectionTesterStatus.Undetermined: 
			testMessage = "Undetermined NAT capabilities";
			doneTestingNAT = false;
			break;
			
		case ConnectionTesterStatus.PrivateIPNoNATPunchthrough: 
			testMessage = "Cannot do NAT punchthrough, filtering NAT enabled hosts for client connections, local LAN games only.";
			filterNATHosts = true;
	
			doneTestingNAT = true;
			break;
			
		case ConnectionTesterStatus.PrivateIPHasNATPunchThrough:
			if (probingPublicIP)
				testMessage = "Non-connectable public IP address (port "+ serverPort +" blocked), NAT punchthrough can circumvent the firewall.";
			else
				testMessage = "NAT punchthrough capable. Enabling NAT punchthrough functionality.";
			// NAT functionality is enabled in case a server is started,
			// clients should enable this based on if the host requires it

			doneTestingNAT = true;
			break;
			
		case ConnectionTesterStatus.PublicIPIsConnectable:
			testMessage = "Directly connectable public IP address.";
		
			doneTestingNAT = true;
			break;
			
		// This case is a bit special as we now need to check if we can 
		// cicrumvent the blocking by using NAT punchthrough
		case ConnectionTesterStatus.PublicIPPortBlocked:
			testMessage = "Non-connectble public IP address (port " + serverPort +" blocked), running a server is impossible.";
			
			// If no NAT punchthrough test has been performed on this public IP, force a test
			if (!probingPublicIP)
			{
				Debug.Log("Testing if firewall can be circumnvented");
				natCapable = Network.TestConnectionNAT();
				probingPublicIP = true;
				timer = Time.time + 10;
			}
			// NAT punchthrough test was performed but we still get blocked
			else if (Time.time > timer)
			{
				probingPublicIP = false; 		// reset
				
				doneTestingNAT = true;
			}
			break;
		case ConnectionTesterStatus.PublicIPNoServerStarted:
			testMessage = "Public IP address but server not initialized, it must be started to check server accessibility. Restart connection test when ready.";
			break;
		default: 
			testMessage = "Error in test routine, got " + natCapable;
	}
	officialNATstatus=true;
	if(doneTestingNAT){
		Debug.Log("TestConn:"+testMessage);
		Debug.Log("TestConn:"+natCapable + " " + probingPublicIP + " " + doneTestingNAT);
	}
}

private var lastHostListRequest : float = 0;

//Request the host limit, but we limit these requests
//Max once every two minutes automatically, max once every 5 seconds when manually requested
function FetchHostList(manual : boolean){
	var timeout : int = 120;
	if(manual){
		timeout=5;
	}
	
	if(lastHostListRequest==0 || Time.realtimeSinceStartup > lastHostListRequest + timeout){
			lastHostListRequest = Time.realtimeSinceStartup;
			MasterServer.RequestHostList (gameName);			
			yield WaitForSeconds(1);//We gotta wait :/			
			hostData = MasterServer.PollHostList();
			yield WaitForSeconds(1);//We gotta wait :/	
			CreateSortedArray();
			Debug.Log("Requested new host list, got: "+hostData.length);
	}
	
	
		
}

//The code below is all about sorting the game list by playeramount

public var sortedHostList : Array;

function CreateSortedArray(){
	
	sortedHostList = new Array();	
	
	var i : int=0;
	var data : HostData[] = hostData;
	for (var element in data)
	{
		AddToArray(i);
		i++;		
	}			
}

function AddToArray(nr : int){
	sortedHostList.Add (nr);	
	SortLastItem();
}

function SortLastItem(){
	if(sortedHostList.length<=1){
		return;
	}
	for(var i=sortedHostList.length-1;i>0;i--){
	var value1 : int= hostData[sortedHostList[i-1]].connectedPlayers;
	var value2 : int = hostData[sortedHostList[i]].connectedPlayers;
		if(value1<value2){
			SwapArrayItem((i-1), i);
		}else{
			//Sorted!
			return;
		}
	}
}

function SwapArrayItem(nr1, nr2){
	var tmp=sortedHostList[nr1];
	sortedHostList[nr1]=sortedHostList[nr2];
	sortedHostList[nr2]=tmp;
}