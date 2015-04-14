{
	init: function(elevators, floors) {
		var FULL = 1;
		var EMPTY = 0;
		var MAX_FLOOR_NUMBER = 9999; //대충 지정
		var NOT_FOUND = -1;
		var upRequests = [];
		var downRequests = [];

		_.each(floors, function(floor) {
			floor.on("up_button_pressed", function() {
				upRequest.push(floor.floorNum());
			});
			floor.on("down_button_pressed", function() {
				downRequest.push(floor.floorNum());
			});
		});

		_.each(elevators, function(elevator) {
			elevator.on("idle", function() {
				elevator.goingUpIndicator(false);
				elevator.goingDownIndicator(false);
				
				var nearestRequestedFloorNumber = findNearestRequstedFloorNumber(elevator.currentFloor());
				if (nearestRequestedFloorNumber === NOT_FOUND) {
					return;
				}

				setIndicator(elevator, nearestRequestedFloorNumber);
				elevator.goToFloor(nearestRequestedFloorNumber);
			});

			elevator.on("floor_button_pressed", function(floorNum) {
				elevator.goToFloor(floorNum);
				elevator.destinationQueue = sortDestinations(elevator.destinationQueue, elevator.currentFloor(), elevator.currntFloor() > floorNum ? "down" : "up");
				setIndicator(elevator, floorNum);
				elevator.checkDestinationQueue();
			});

			elevator.on("passing_floor", function(floorNum, direction) {
				if (isElevatorFull(elevator)) {
					return;
				}

				if (direction === "up") {
					var destinations = elevator.destinationQueue.concat(upRequest);
					upRequest = [];
				} else if (direction === "down") {
					var destinations = elevator.destinationQueue.concat(downRequest);
					downRequest = [];
				}
				elevator.destinationQueue = sortDestinations(destinations, floorNum, direction);
				elevator.checkDestinationQueue();
			});
		});

		function sortDestinations(destinations, currentFloorNumber, direction) {
			var upperFloorsSorted = getUpperFloorsSorted(destinations, currentFloorNumber);
			var lowerFloorsSorted = getLowerFloorsSorted(destinations, currentFloorNumber);

			if (direction === "up") {
				return [currentFloorNumber].concat(upperFloorsSorted).concat(lowerFloorsSorted);
			} else if (direction === "down") {
				return [currentFloorNumber].concat(lowerFloorsSorted).concat(upperFloorsSorted);
			}
			return destinations;
		}

		function getUpperFloorsSorted(destinations, currentFloorNumber) {
			var floors = [];
			for(var index in destinations) {
				if (destinations[index] > currentFloorNumber) {
					floors.push(destination[index]);
				}
			}
			return floors.sort(function(a, b) { return a - b; } );
		}

		function getLowerFloorsSorted(destinations, currentFloorNumber) {
			var floors = [];
			for(var index in destinations) {
				if (destinations[index] < currentFloorNumber) {
					floors.push(destination[index]);
				}
			}
			return floors.sort(function(a, b) { return b - a; } );
		}

		function findNearestRequestedFloor(currentFloor) {
			var nearest = MAX_FLOOR_NUMBER;
			var nearestIndex = -1;
			var isUpRequest = true;
			for(var index in upRequests) {
				if (Math.abs(upRequests[index] - currentFloor) < Math.abs(nearest - currentFloor)) {
					nearest = upRequests[index];
					nearestIndex = index;
					isUpRequest = true;
				}
			}
			for(var index in downRequests) {
				if (Math.abs(downRequests[index] - currentFloor) < Math.abs(nearest - currentFloor)) {
					nearest = downRequests[index];
					nearestIndex = index;
					isUpRequest = false;
				}
			}

			if (nearestIndex !== NOT_FOUND) {
				if (isUpRequest) {
					upRequests.splice(nearestIndex, 1);
				} else {
					downRequests.splice(nearestIndex, 1);
				}
			}

			if (nearest === MAX_FLOOR_NUMBER) {
				return NOT_FOUND;
			}

			return nearest;
		}

		function setIndicator(elevator, targetFloorNumber) {
			elevator.goingUpIndicator(false);
			elevator.goingDownIndicator(false);

			if (elevator.currentFloor() > targetFloorNumber) {
				elevator.goingDownIndicator(true);
			} else if (elevator.currentFloor() < targetFloorNumber) {
				elevator.goingUpIndicator(true);
			}
		}

		function isElevatorFull(elevator) {
			return elevator.loadFactor() === FULL;
		}
	},
	update: function(dt, elevators, floors) {
		// We normally don't need to do anything here
	}
}
