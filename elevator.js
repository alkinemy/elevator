{
	init: function(elevators, floors) {
		var FULL = 1;
		var EMPTY = 0;
		var MAX_FLOOR_NUMBER = 9999; //대충 지정
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

				if (nearestRequestedFloorNumber === -1) {
					return;
				}

				setIndicator(elevator, nearestRequestedFloorNumber);
				elevator.goToFloor(nearestRequestedFloorNumber);
			});

			elevator.on("floor_button_pressed", function(floorNum) {
				if (isElevatorFull(elevator)) {
					return;
				}

				if (isTargetFloorPlacedGoUpWay(elevator, floorNum) || isTargetPlacedGoDownWay(elevator, floorNum)) {
					removeUpRequest(floorNum);
					elevator.goToFloor(floorNum, true);
				} else {
					removeDownRequest(floorNum);
					elevator.goToFloor(floorNum);
				}
			});
		});

		function removeUpRequest(floorNum) {
			for(var index in upRequests) {
				if (upRequests[index] === floorNum) {
					upRequests.splice(index, 1);
					return;
				}
			}
		}

		function removeDownRequest(floorNum) {
			for(var index in downRequests) {
				if (downRequests[index] === floorNum) {
					downRequests.splice(index, 1);
					return;
				}
			}
		}

		function findNearestRequestedFloor(currentFloor) {
			var nearest = MAX_FLOOR_NUMBER;
			var nearestIndex = -1;
			var isUpRequest = true;
			for(var index in upRequests) {
				if (Math.abs(upRequests[index] - currentFloor) < nearest) {
					nearest = upRequests[index];
					nearestIndex = index;
					isUpRequest = true;
				}
			}
			for(var index in downRequests) {
				if (Math.abs(downRequests[index] - currentFloor) < nearest) {
					nearest = downRequests[index];
					nearestIndex = index;
					isUpRequest = false;
				}
			}

			if (nearestIndex !== -1) {
				if (isUpRequest) {
					upRequests.splice(nearestIndex, 1);
				} else {
					downRequests.splice(nearestIndex, 1);
				}
			}

			if (nearest === MAX_FLOOR_NUMBER) {
				return -1;
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

		function isTargetFloorPlacedGoUpWay(elevator, targetFloorNumber) {
			return elevator.goingUpIndicator() && elevator.currentFloor() < targetFloorNumber && elevator.destinationQueue[0] > targetFloorNumber)
		}

		function isTargetFloorPlacedGoDownWay(elevator, targetFloorNumber) {
			return elevator.goingDownIndicator() && elevator.currentFloor() > targetFloorNumber && elevator.destinationQueue[0] < targetFloorNumber)
		}
	},
	update: function(dt, elevators, floors) {
		// We normally don't need to do anything here
	}
}
