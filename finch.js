/*
 * finch.js - A library for the Birdbrain Technologies Finch Robot 1.0 using
 * the WebHID API.
 *
 * Based off of the official Python library for the same robot and is mostly
 * compatible, however values in this library are generally from 0-255 rather
 * than 0-1. See this link for more on the original Python library:
 * https://learn.birdbraintechnologies.com/finch1/python/install
 *
 * Copyright 2023 Michael M.
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 * SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
 * OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 * CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

/*
 * ===========================================================================
 * PRIVATE API
 * ===========================================================================
 */

// Asynchronously ends the command cmd to the robot along with the parameters
// msg. Leave msg empty for commands to receive from the Finch, and msg=[0] for
// other commands that take no parameters.
async function send(cmd, msg) {
  const arr = new Uint8Array(8);
  arr[0] = cmd.charCodeAt(0);
  let i;
  for (i = 0; i < msg.length + 1; i++)
    arr[i+1] = msg[i];
  for (; i < arr.length; i++)
    arr[i] = 0;
  console.log('sending', arr)
  window.device.sendReport(0, arr);
}

// Asynchronously receives data from the robot and returns the buffer received
// as a Uint8Array.
function recv() {
  return new Promise(res => {
    device.addEventListener('inputreport', event => {
      res(new Uint8Array(event.data.buffer));
    }, {once: true});
  });
}

/*
 * ===========================================================================
 * PUBLIC API
 * ===========================================================================
 */

/**
 * Returns a promise that resolves after sec seconds.
 * 
 * @param {number} sec - Time in seconds to resolve after
 *
 * @async
 *
 * @example
 * // Print the second string one second after the first;
 * console.log('string 1');
 * await wait(1);
 * console.log('string 2')
 */
export function wait(sec) {
  return new Promise(res => setTimeout(res, sec * 1000));
}

/**
 * A callback to be run from run()
 *
 * @callback run_callback
 * @async
 */

/**
 * Wraps an async function to assure the Finch robot is connected before and
 * disconnected after any code runs.
 *
 * Because of browser security restrictions, this function call only be called
 * in response to a user gesture. For example, in the `click` event handler of
 * a button.
 *
 * @param {run_callback} prog - An asynchronous function callback.
 *
 * @example
 * // Running both wheels at full speed for one second, then close the
 * // connection.
 * run(async function() {
 *   await wheels(255, 255);
 *   await wait(1);
 * });
 */
export function run(prog) {
  (async function() {
    // Get device permissions & connnect
    if (!window.device) {
      const devices = await navigator.hid.requestDevice({ filters: [] });
      window.device = devices[0];
    }
    if (!device.opened) await device.open();
   
    // Get the command ID. Unused but useful for debugging.
    await send('z', []);
    const data = new Uint8Array(await recv());
    window.cmdId = data[0];
   
    // Run user program
    await prog();
   
    // Put in idle mode and close connection
    await send('R', [0]);
    await device.close();
  })();
}

/**
 * Asynchronously sets speed of each wheel. 0 is not moving, while 255 is full
 * speed.
 *
 * @param {number} left - Speed of the left wheel from 0 to 255.
 * @param {number} right - Speed of the right wheel from 0 to 255.
 *
 * @async
 *
 * @example
 * // Turn clockwise by setting the left wheel to full speed.
 * await wheels(255, 0);
 */
export function wheels(left, right) {
  return send('M', [0, left, 0, right]);
}

/**
 * Asynchronously runs the robot's buzzer at freq hertz for sec seconds. 
 *
 * @param {number} sec - Time in seconds.
 * @param {number} freq - Frequency in hertz.
 *
 * @async
 *
 * @example
 * // Play an A4 note (440 Hz) for one second.
 * await buzz(1, 440);
 */
export async function buzz(sec, freq) {
  await send('B', [((sec * 1000) & 0xFF00) >> 8, (sec * 1000) & 0x00FF,
    (freq & 0xFF00) >> 8], freq && 0xFF);
  await wait(sec);
}

/**
 * Sets the LED light to the color with the RGB value passed. Each component of
 * the RGB value is in the range of 0-255.
 *
 * @param {number} r - Red component of the RGB value.
 * @param {number} g - Green component of the RGB value.
 * @param {number} b - Blue component of the RGB value.
 *
 * @async
 *
 * @example
 * // Set the LED to magenta (RGB value 255, 0, 255).
 * await led(255, 0, 255);
 */
export function led(r, g, b) {
  return send('O', [r, g, b]);  
}

/**
 * Asynchronously halts the robot and stops all commands currently running on
 * the robot.
 *
 * @async
 *
 * @example
 * // Move at full speed forward for one second.
 * await wheels(255, 255);
 * await wait(1);
 * await halt();
 */
export function halt() {
  return send('X', [0]);
}

/**
 * Returns a promise that resolves with the status array of the obstacle
 * sensors. The first element is the status of the left obstacle sensor and the
 * second element is the status of the right obstacle sensor. Each value is
 * either false (no obstacle) or true (obstacle)
 *
 * @async
 * @returns {Promise<boolean[]>} The status array of the obstacle sensors.
 *
 * @example
 * // Turn the LED red if there is an obstacle, otherwise green.
 * const obstacles = await get_obstacles();
 * if (obstacles.every(x => x)) {
 *   await led(0, 255, 0);
 * } else {
 *   await led(255, 0, 0);
 * }
 */
export async function get_obstacles() {
  await send('I', []);
  const data = await recv();
  return data.slice(0, 2).map(x => x === 1);
}

/**
 * Returns a promise that resolves with the status of the acceleration sensor.
 * as an object.
 *
 * @async
 * @returns {Promise<Object>} Status of the acceleration sensor.
 *
 * @example
 * // Move forward if the robot is being tapped.
 * const accel = await get_acceleration();
 * if (accel.tap) {
 *   await wheels(255, 255);
 * }
 */
export async function get_acceleration() {
  // convert finch readings to Gs
  function convAccel(a) {
    if (a > 31) a -= 64
    return a * 1.6 / 32.0
  }
 
  await send('A', []);
  const data = await recv();
  const accel = data.slice(0, 3).map(convAccel);
  return {
    x: accel[0], y: accel[1], z: accel[2],
    tap: (data[4] & 0x20) !== 0, shake: (data[4] & 0x80) !== 0
  };
}

/**
 * Returns a promise that resolves with the temperature detected by the robot
 * in degrees Celcius.
 *
 * @async
 * @returns {Promise<number>} Temperature in degrees Celcius
 *
 * @example
 * // Print the temperature in degrees Fahrenheit.
 * const temp_c = await get_temperature();
 * console.log(temp_c * 1.8 + 32);
 */
export async function get_temperature() {
  await send('T', []);
  const data = await recv();
  return (data[0] - 127) / 2.4 + 25;
}

/**
 * Returns a promise that resolves with the status array of the light sensors.
 * The first element is the intensity of the light on the left sensor, and the
 * second element is the intensity of the light on the right sensor. Each
 * value is from 0 (full darkness) to 255 (full brightness).
 *
 * @async
 * @returns {Promise<number[]>} Status array of the light sensors.
 */
export async function get_light() {
  await send('L', []);
  const data = await recv();
  return data.slice(0, 2);
}

