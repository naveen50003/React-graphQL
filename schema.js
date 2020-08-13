const { GraphQLObjectType, GraphQLInt, GraphQLBoolean, GraphQLString, GraphQLList, GraphQLSchema, GraphQLNonNull, GraphQLScalarType } = require('graphql');
const axios = require('axios');

//Launch Type
const LaunchType = new GraphQLObjectType({
    name:'Launch',
    fields: () =>({
        id: { type: GraphQLInt},
        flight_number: { type: GraphQLInt },
        mission_name: { type: GraphQLString },
        launch_year: { type: GraphQLString },
        launch_date_local: { type: GraphQLString },
        launch_success: { type: GraphQLBoolean },
        rocket: { type: RocketType },
    })
})

const RocketType = new GraphQLObjectType({
    name:'RocketType',
    fields: () =>({
        rocket_id: { type: GraphQLString },
        rocket_name: { type: GraphQLString },
        rocket_type: { type: GraphQLString },
    })
})

//RooT Query
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        launches: {
            type: new GraphQLList(LaunchType),
            resolve(parent, args) {
                return axios.get('http://localhost:3004/launches')
                   .then(res => res.data);
            }
        },
        launch : {
            type: LaunchType,
            args: {
                id: {type: GraphQLInt}
            },
            resolve(parent, args) {
                return axios.get(`http://localhost:3004/launches/${args.id}`)
                .then(res => res.data);
            }
        },
        rockets: {
            type: new GraphQLList(RocketType),
            resolve(parent, args) {
                return axios.get('https://api.spacexdata.com/v3/rockets')
                   .then(res => res.data);
            }
        },
        rocket : {
            type: RocketType,
            args: {
                id: {type: GraphQLInt}
            },
            resolve(parent, args) {
                return axios.get(`https://api.spacexdata.com/v3/rockets/${args.id}`)
                .then(res => res.data);
            }
        }
    }
})

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addMission: {
            type: LaunchType,
            args: {
                 id: { type: new GraphQLNonNull(GraphQLInt) },
                 flight_number: { type: new GraphQLNonNull(GraphQLInt) },
                 mission_name: { type: new GraphQLNonNull(GraphQLString) },
                 launch_year: { type: GraphQLString },
            },
            resolve(parentValue, args){
                const { id, flight_number, mission_name, launch_year } = args;
                return axios.post('http://localhost:3004/launches', {
                  id,
                  flight_number,
                  mission_name,
                  launch_year
                })
                .then(res => res.data)
            }
        },
        deleteMission: {
            type: LaunchType,
            args: {
                 id: { type: new GraphQLNonNull(GraphQLInt) },
            },
            resolve(parentValue, args){
                const { id } = args;
                return axios.delete(`http://localhost:3004/launches/${id}`)
                .then(res => res.data)
            }
        },
        editMission: {
            type: LaunchType,
            args: {
                 id: { type: new GraphQLNonNull(GraphQLInt) },
                 mission_name: {
                     type: GraphQLString,
                 },
                 launch_year: { type: GraphQLString}
            },
            resolve(parentValue, args){
                const { id } = args;
                return axios.patch(`http://localhost:3004/launches/${id}`, args)
                .then(res => res.data)
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})