// array1 and array2 entha rendu arraylayum match akura number la thaniya oru arrayla store akum 
const array1 = [ [1, 2, 3, 44, 45],[14, 24, 34, 4, 5],[12, 23, 33, 44, 55], [19, 21, 23, 4, 52], [1, 2, 4, 5, 98]];
const array2 = [3, 4, 5, 6, 7];

const matches = array1.map(subarray =>
  subarray.filter(num => array2.includes(num))
);
console.log('Matches for each subarray:', matches);
answer:Matches for each subarray: [ [ 3 ], [ 4, 5 ], [], [ 4 ], [ 4, 5 ] ]
_____________________

// rentu matchja erukura data va mattum thaniya etukurom 
const array = [[3], [4, 5], [], [4], [4, 5]];

const lengthTwoSubarrays = array.filter(subarray => subarray.length === 2);
console.log('Subarrays with length 2:', lengthTwoSubarrays);
answer:Subarrays with length 2: [ [ 4, 5 ], [ 4, 5 ] ]
___________________________________________________________________________________________________________________________
