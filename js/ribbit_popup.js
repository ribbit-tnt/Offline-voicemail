Ribbit.getAuthenticatedUserInPopup = function(callback, name, windowOptions) {
	var win = null;
	//works around internet explorer 8 showing dialogs for cross ssl requests and blocking win.close
	//will result in a beep every 5 seconds after approval until the user clears dialogs.
	var closeWin = function(){
		(function(){try{if (!win.closed){win.close();}}catch (e){}})();
		if (win !== null && !win.closed){setTimeout(closeWin,5000);}
	};
	var gotUrlCallback = function(result){
		if (result.hasError){
			callback(new Ribbit.RibbitException("Cannot get request token, check application credentials.", 0));
		}
		else{
			var timeOutPoint = new Date().getTime() + 300000;  
			
			var pollApproved = function(){
				var w = true;
				setTimeout(function(){
					if (w && (win === null || typeof (win) === "undefined")){
						callback(new Ribbit.RibbitException("Could not open a new window. Pop ups may be blocked.", 0));
					}
					else{
						var closed = false;
						try{
							closed = win.closed;
						} catch(e){}
						w = false;
						var cb = function(val){
							if (!val.hasError){
								closeWin();
								callback(true);
							}
							else if (new Date().getTime() > timeOutPoint) {
								closeWin();
								callback(new Ribbit.RibbitException("Timed out.", 0));
							}
							else if (closed) {
								callback(new Ribbit.RibbitException("User closed window without authenticating.", 0));
							}
							else{
								pollApproved();
							}
						};
						Ribbit.checkAuthenticatedUser(cb);
					}
				},4000);
			};
			
			name = name === undefined ? "RibbitLogin" : name;
			windowOptions = windowOptions === undefined ? "width=1024,height=800,toolbar:no" : windowOptions;
			
			win = window.open(result, name, windowOptions);
			pollApproved();
		}
	};
	Ribbit.createUserAuthenticationUrl(gotUrlCallback);
};