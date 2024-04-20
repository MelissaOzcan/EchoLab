import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;
import java.io.*;
import java.lang.reflect.Method;
import java.nio.file.*;
import java.net.*;
import java.util.regex.*;

public class Main {
    public static void main(String[] args) {
        try {
            String sourceCode = new String(Files.readAllBytes(Paths.get("code.java")));

            Pattern classNamePattern = Pattern.compile("public\\s+class\\s+([\\w]+)\\s*\\{");
            Matcher matcher = classNamePattern.matcher(sourceCode);
            String className;
            if (matcher.find()) {
                className = matcher.group(1);
            } else {
                throw new IllegalArgumentException("No valid class name found in the source code.");
            }

            File root = new File("/tmp");
            File sourceFile = new File(root, className + ".java");
            Files.write(sourceFile.toPath(), sourceCode.getBytes());

            JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
            compiler.run(null, null, null, sourceFile.getPath());

            URLClassLoader classLoader = URLClassLoader.newInstance(new URL[] { root.toURI().toURL() });
            Class<?> cls = Class.forName(className, true, classLoader);
            Object instance = cls.getDeclaredConstructor().newInstance();

            Method method = cls.getMethod("main", String[].class);
            String[] params = null;
            method.invoke(null, (Object) params);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
