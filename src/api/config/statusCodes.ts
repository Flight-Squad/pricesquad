const StatusCodes = Object.freeze({
  Get: {
    success: 200,
    NoContent: 204,
  },
  Post: {
    success: 201,
  },
  Error: {
    Client:{
      BadRequest: 400,
    },
    Server: {
      NotImplemented: 501,
    },
  }
})

export default StatusCodes;
