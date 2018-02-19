class Utils {

  static uuid() {
    let i,
      random,
      id = "";

    for (i = 0; i < 32; i++) {
      random = (Math.random() * 16) | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        id += "-";
      }
      id += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16);
    }
    return id;
  }

  static pluralize(count, word) {
    return count === 1 ? word : word + "s";
  }

  static mergeTodos(todos, streamData) {
    // generate an array of ids of streamData
    const streamDataIds = streamData.map(todo => todo._id);

    return todos
      // consider streamData as the source of truth
      // first take existing todos which are not present in stream data
      .filter(({ _id }) => !streamDataIds.includes(_id))
      // then add todos from stream data
      .concat(streamData)
      // remove todos which are deleted in stream data
      .filter(todo => !todo._deleted)
      // finally sort on the basis of creation timestamp
      .sort((a, b) => a.createdAt - b.createdAt);
  }
}

export default Utils;
