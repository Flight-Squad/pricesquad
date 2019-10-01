const StatusCodes = Object.freeze({
  Get: {
    success: 200,
  },
  Post: {
    success: 201,
  },
  Error: {
    Client:{
      BadRequest: 400,
    },
    Server: {},
  }
})

export default StatusCodes;
