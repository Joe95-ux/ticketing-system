// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TicketTracker {
    struct Ticket {
        string ticketId;
        string status;
        address creator;
        uint256 createdAt;
        uint256 updatedAt;
    }

    mapping(string => Ticket) public tickets;
    mapping(address => string[]) public userTickets;
    
    event TicketCreated(
        string ticketId,
        string status,
        address creator,
        uint256 timestamp
    );
    
    event TicketUpdated(
        string ticketId,
        string status,
        uint256 timestamp
    );

    function createTicket(string memory _ticketId) public {
        require(bytes(tickets[_ticketId].ticketId).length == 0, "Ticket already exists");
        
        tickets[_ticketId] = Ticket({
            ticketId: _ticketId,
            status: "OPEN",
            creator: msg.sender,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        userTickets[msg.sender].push(_ticketId);
        
        emit TicketCreated(_ticketId, "OPEN", msg.sender, block.timestamp);
    }
    
    function updateTicketStatus(string memory _ticketId, string memory _status) public {
        require(bytes(tickets[_ticketId].ticketId).length > 0, "Ticket does not exist");
        
        Ticket storage ticket = tickets[_ticketId];
        ticket.status = _status;
        ticket.updatedAt = block.timestamp;
        
        emit TicketUpdated(_ticketId, _status, block.timestamp);
    }
    
    function getTicket(string memory _ticketId) public view returns (
        string memory ticketId,
        string memory status,
        address creator,
        uint256 createdAt,
        uint256 updatedAt
    ) {
        Ticket memory ticket = tickets[_ticketId];
        require(bytes(ticket.ticketId).length > 0, "Ticket does not exist");
        
        return (
            ticket.ticketId,
            ticket.status,
            ticket.creator,
            ticket.createdAt,
            ticket.updatedAt
        );
    }
    
    function getUserTickets(address _user) public view returns (string[] memory) {
        return userTickets[_user];
    }
} 