var ref = require("ref");
var lib = require("./gphoto2");

function use_camera(context, camera)
{
    pathPtr = ref.alloc(lib.CameraFilePath);
    //path = new lib.CameraFilePath

    let res = lib.gp_camera_capture(camera, lib.GP_CAPTURE_IMAGE, pathPtr, context);
    if (res < 0)
    {
        console.log("ERROOOOOOR");
        //printf("Could not capture image:\n%s\n", lib.gp_port_result_as_string(res));
        return (-1);
    }
    path_folder = pathPtr.deref().folder.buffer.readCString(0);
    path_name = pathPtr.deref().name.buffer.readCString(0);
    console.log("Photo temporarily saved in " + path_folder + path_name);

    let destPtr = ref.alloc(lib.CameraFile);
    if (lib.gp_file_new(destPtr) < 0)
        return -1;
    let dest = destPtr.deref();
    res = lib.gp_camera_file_get(camera, path_folder, path_name,
        lib.GP_FILE_TYPE_NORMAL, dest, context);
    if (res < 0)
    {
        console.log("Could not load image:\n" +
            lib.gp_port_result_as_string(res));
        return (-1);
    }

    let dest_path = "my_photo";
    res = lib.gp_file_save(dest, dest_path);
    if (res < 0)
    {
        console.log("Could not save image in " + dest_path + ":\n" +
            lib.gp_port_result_as_string(res));
        return (-1);
    }
    console.log("Image saved in " + dest_path);
    lib.gp_file_unref(dest);

    return 0;
}

function main()
{
    let context = lib.gp_context_new()

    if (context.isNull())
        return 1;

    let cameraInfosPtr = ref.alloc(lib.CameraList);
    if (lib.gp_list_new(cameraInfosPtr) < 0)
        return 1;
    let cameraInfos = cameraInfosPtr.deref();

    if (lib.gp_camera_autodetect(cameraInfos, context) < 0)
        return 1;
    console.log(lib.gp_list_count(cameraInfos) + " cameras detected");
    lib.gp_list_unref(cameraInfos);

    let cameraPtr = ref.alloc(lib.Camera);
    if (lib.gp_camera_new(cameraPtr) < 0)
        return -1;
    let camera = cameraPtr.deref();
    if (lib.gp_camera_init(camera, context) < 0)
    {
        console.log("Could not initialize camera\n");
        return -1;
    }
    use_camera(context, camera);

    lib.gp_camera_exit(camera, context);
    lib.gp_camera_unref(camera);

    lib.gp_context_unref(context);

    return 0;
}

console.log("main returned: " + main());